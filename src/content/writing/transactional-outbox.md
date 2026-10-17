---
title: 'The gap between a commit and an event'
description: 'Why a transactional outbox connects a database change to an event without pretending a broker publish is atomic.'
publishedAt: 2026-10-17
type: 'Field note'
topic: 'Data systems'
readingTime: '4 min'
issue: '03'
featured: false
---

An order service updates PostgreSQL and then publishes `OrderCreated` to a broker. If the process dies between those statements, the database says the order exists while downstream services never hear about it. Publishing first has the opposite failure: consumers act on an event that a later database rollback removes. This is the dangerous gap between two systems.

The transactional outbox puts the event beside the business row in the same local transaction:

```sql
BEGIN;
INSERT INTO orders (id, status) VALUES (:id, 'PENDING');
INSERT INTO outbox (id, topic, aggregate_id, payload)
VALUES (:event_id, 'orders.created', :id, :json);
COMMIT;
```

A relay polls committed outbox rows, publishes them, and records a sent timestamp. A crash after publish and before that timestamp creates a duplicate on the next poll. Consumers must therefore use an event ID, a business key, or a guarded state transition to make reprocessing harmless. The outbox solves the missing-event gap; it does not provide exactly-once effects.

The transaction boundary is still local to the database. It cannot roll back an email, a payment provider call, or a broker publish that already happened. Model those actions as consumers of a durable fact, give each one a replay-safe key, and keep a repair path for an event that remains stuck. Also version the payload: adding a field is easy to roll out, while changing the meaning of an existing field can break a consumer that is replaying old rows months later.

The relay also needs operational boundaries: batch rows, cap retries, retain failures for inspection, and expose the age of the oldest unsent row. Ordering is usually guaranteed per aggregate by using its ID as the broker partition key, but a consumer should still tolerate late or repeated events. Cleanup needs a retention policy that outlives the maximum replay and audit window.

Two-phase commit could coordinate a database and broker, but it adds coordinator and recovery complexity and is not available for many external APIs. Change-data capture is another valid relay, especially when a platform already operates a log pipeline, but it still requires event contracts and idempotent consumers. Choose the smallest mechanism that gives operators a way to replay a committed fact.

Multiple relay workers can claim different rows, but claiming is not delivery. A lease or database lock should prevent two workers from doing the same polling work, and the lease must expire so a crashed worker does not strand rows. The broker remains the source of delivery attempts; the outbox remains the audit trail.

## Sources

- [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html) — Chris Richardson, microservices.io.
- [Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html) — PostgreSQL documentation.
- [Message delivery semantics](https://kafka.apache.org/documentation/#semantics) — Apache Kafka documentation.
