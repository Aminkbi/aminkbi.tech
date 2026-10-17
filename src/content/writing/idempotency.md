---
title: 'Making retries safe with idempotency'
description: 'How to make a retried command produce one business effect when the network can lose the response.'
publishedAt: 2026-10-17
type: 'Field note'
topic: 'Distributed systems'
readingTime: '4 min'
issue: '02'
featured: false
---

A client times out after sending `POST /orders`. The server may have committed the order; the response may simply have vanished. Retrying without a stable identity can create two orders. Retrying with an idempotency key lets the server answer the same command again, but only if the key has a clear scope and the stored result is authoritative.

## Give a command an identity

The client creates a high-entropy key for one intended operation and sends it with every retry:

```text
Idempotency-Key: 2a3c...e91
```

The order service stores `(client_id, key, request_digest, status, result)` under a unique constraint. On the first request, it validates the payload and performs the business write in one transaction. A concurrent request with the same key waits for that record, then receives the original result. A key reused with a different payload is an error; silently treating it as the old request hides client bugs.

This scope matters. A key for “create this order” should not be reused for “capture this payment,” and a payment provider’s idempotency namespace may have a different expiry or tenant boundary. Persist the provider key alongside the payment attempt so a retry after an ambiguous timeout refers to the same provider operation.

Idempotency does not mean the whole system executes once. A broker can deliver an event more than once, and a relay can publish an outbox row again after a crash. Each consumer needs a deduplication record or an idempotent state transition. A unique key prevents a duplicate *business effect* only where the key is checked.

Concurrency needs a deliberate response. Two requests with the same key can arrive before either one commits. A unique constraint makes one winner, while the loser should read the winner’s record rather than run the command again. If the winner is still processing, return a retryable “in progress” status and keep the key bound to that payload. If validation fails before the business write, record the rejection consistently or let the client correct the request and choose a new key. The exact response shape is an API choice; the invariant is that concurrent callers cannot each create a separate effect.

Retention is a product decision. Keep keys long enough to cover client retries, delayed queues, and the provider’s replay window; expire them only when reusing the key cannot plausibly refer to the original operation. Return the saved result for a completed command, and return a stable “in progress” response for work that is still running. Do not report failure merely because the first response was lost.

The useful contract is modest: the same command identity maps to one recorded result within a defined scope. That contract makes retries safe while leaving delivery, timing, and recovery behavior explicit.

## Sources

- [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) — AWS Builders’ Library.
- [Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html) — PostgreSQL documentation.
- [Message delivery semantics](https://kafka.apache.org/documentation/#semantics) — Apache Kafka documentation.
