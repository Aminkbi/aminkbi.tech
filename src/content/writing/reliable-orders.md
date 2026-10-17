---
title: 'Accepting orders when dependencies fail'
description: 'A single-region baseline for accepting orders safely when inventory, payment, or messaging dependencies fail.'
publishedAt: 2026-10-17
type: 'Deep dive'
topic: 'Distributed systems'
readingTime: '8 min'
issue: '01'
featured: true
---

An order is more than a row called `orders`. It is a promise that a customer can rely on: their request was understood, money will not be captured twice, and a stock decision will not disappear because one process crashed. The difficult part is keeping that promise while each dependency can be slow, unavailable, or able to receive the same request twice.

This is a conceptual design, not a benchmark. It assumes one region, a PostgreSQL primary, an event broker such as Kafka, and separate order, inventory, payment, and notification services. The goal is a durable answer to “what happened to my order?” before adding multi-region writes.

## Decide what “accepted” means

The customer-facing API should make one small guarantee: if it returns an order ID, the system has durably recorded the customer’s intent. It does not claim that payment has settled or inventory has been reserved yet. The order can be `PENDING`, then become `CONFIRMED` after the workflow succeeds, or `REJECTED` with a reason that can be shown to the customer.

The request handler does not hold a database transaction open while it calls payment and inventory. It writes the order and a command for later work in one local transaction, then returns `202 Accepted` with the order ID and status URL.

## A durable baseline

The order service owns the order state and the idempotency key supplied by the client. A simplified request looks like this:

```text
POST /orders
Idempotency-Key: cart-7f3...

{ "customer": "c42", "items": [{"sku": "book-9", "quantity": 1}] }
```

Inside one PostgreSQL transaction, the service inserts the order, records a digest of the request, and writes an outbox event. The database commit is the point at which the promise becomes real:

```sql
BEGIN;

INSERT INTO orders (id, customer_id, status, request_digest)
VALUES (:order_id, :customer, 'PENDING', :digest);

INSERT INTO outbox (event_id, topic, aggregate_id, payload)
VALUES (:event_id, 'orders.created', :order_id, :payload);

COMMIT;
```

An outbox relay reads committed rows and publishes them to Kafka. If the order transaction rolls back, there is no event to publish. If the relay crashes after publishing but before marking the row sent, it can publish the same event again; consumers therefore need their own deduplication. The pattern removes the database-to-broker *gap*, not every possible duplicate.

The inventory consumer handles `orders.created` with a local transaction. It checks a unique `(consumer_name, event_id)` record (or an equivalent business key), attempts a reservation, and emits an `inventory.reserved` or `inventory.rejected` event through its own outbox. A redelivery then becomes a no-op. The payment consumer follows the same shape, but its provider call needs an idempotency key derived from the order attempt. A network timeout cannot tell us whether the provider charged the card, so a retry must ask the provider to reuse the original result rather than create another charge.

The order service consumes the resulting events and advances state with guarded transitions:

```text
if status == PENDING and inventory.reserved and payment.authorized:
    status = CONFIRMED
if status == PENDING and inventory.rejected:
    status = REJECTED("out of stock")
```

The update is conditional on the current state. A late rejection cannot overwrite a confirmed order, and a duplicate confirmation does not trigger a second email. Notifications are downstream effects; they can be retried from an event or a durable notification table without changing the order’s business state.

## When a dependency breaks

Suppose the payment provider times out after receiving an authorization request. The payment service marks the attempt `UNKNOWN`, keeps the provider idempotency key, and retries with backoff. It does not tell the customer “declined” merely because the HTTP response was lost. If the provider eventually reports success, the order can proceed. If the provider reports failure, inventory can be released and the order can be rejected. A timeout is a state that needs reconciliation, not an answer.

If inventory rejects a reservation, the order transitions to `REJECTED`. Its coordinator releases any successful reservations and voids a payment authorization; if money was already captured, a durable refund workflow is required. A late payment success for a rejected order triggers compensation rather than confirmation. Each compensating operation needs its own idempotency key and retry policy. If Kafka is unavailable, the committed outbox row remains pending; a relay can catch up later. If a consumer crashes after reserving stock but before acknowledging the message, it sees the event again. The consumer’s unique operation record makes that replay safe, while an operator can inspect stuck reservations with a timeout policy.

These guarantees require observability. Record the order ID, event ID, attempt number, and provider request ID in structured logs. Track the oldest outbox row, time in each order state, retry counts, and `UNKNOWN` payment attempts. A status endpoint should expose a stable reason without internal stack traces.

## Tradeoffs and the next boundary

This baseline favors availability within one region and an explicit asynchronous customer experience. It gives each service local transactions and makes recovery inspectable, but it does not provide an instantaneous global view of stock. A single order may be pending while the system resolves a dependency failure, and a repair workflow is part of normal operation.

Multi-region writes change the problem rather than solving it. A practical next step is to assign an order to a home region, keep its state transitions there, and replicate read models elsewhere. Active-active inventory or payment requires a conflict policy, capacity partitioning, and a failover procedure for in-flight orders. Those choices should follow measured recovery objectives; they should not be hidden behind a claim of “exactly once.” Kafka can provide at-least-once delivery and ordering within a partition, while application-level idempotency determines whether a repeated effect is safe.

The promise is therefore specific: once the API acknowledges an order, its intent and next action are durable, every side effect has a replay-safe key, and failures lead to a visible state or a repairable queue. That is a smaller promise than “nothing ever fails,” and a much more useful one.

## Sources

- [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) — AWS Builders’ Library.
- [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html) — Chris Richardson, microservices.io.
- [Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html) — PostgreSQL documentation.
- [Message delivery semantics](https://kafka.apache.org/documentation/#semantics) — Apache Kafka documentation.
