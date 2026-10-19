---
title: 'Choosing between an LSM-tree and a B-tree'
description: 'A metrics workload shows where each storage engine spends its I/O budget, from page writes and WALs to SSTables and compaction.'
publishedAt: 2026-10-19
type: 'Deep dive'
topic: 'Data systems'
readingTime: '8 min'
issue: '04'
featured: false
---

A metrics service receives a steady stream of points. It must make each point durable, answer recent point lookups, and scan a time range when an operator investigates an incident. The workload is write-heavy, but the reads still have a latency target. Which storage engine should hold the data: an LSM-tree or a B-tree?

The useful answer starts with the write path. An LSM-tree buffers writes, writes immutable sorted files, and merges those files in the background. A B-tree keeps keys ordered in fixed-size pages and updates those pages in place. The first design turns many small writes into larger sequential writes; the second keeps lookups and range scans predictable. Each moves cost to a different part of the system.

This is a conceptual model, not a benchmark. The numbers are a small worked example so that the mechanisms stay visible. A production decision still needs a long-running test with the real key distribution, read mix, hardware, and latency objectives.

## The workload decides what “fast” means

Assume the service receives 1,000 metric points, each 1 KiB, over a short interval. Keys are scattered across the key space, so the storage engine cannot assume that consecutive writes land on the same page. Every point must survive a crash before the service acknowledges it. Operators read individual series and occasionally scan a time window.

The storage engine therefore has four jobs:

- make the write durable;
- absorb a stream of small writes;
- find one key without scanning the database;
- return an ordered range without hiding its I/O cost.

There is no single “database speed” number here. A design that writes more bytes may still win if it gives the required read latency. A design that looks excellent on an empty database can lose once its background work competes with new writes.

## An LSM-tree turns scattered writes into sorted runs

An LSM-tree starts with an append-only log. The log protects the in-memory table, or memtable, from a crash. New points enter the memtable in key order; when it reaches a threshold, the engine freezes it and writes it as a sorted string table, or SSTable. The next write goes to a new memtable while the immutable file is being written.

The read path checks the current memtable first, then the newest SSTable, then older files. Each SSTable has a sparse index and usually a Bloom filter. A negative Bloom-filter result proves that a file cannot contain the key, so the engine can skip that file. A positive result means “look here,” not “the key is present.”

The files are immutable after they are written. A background compaction merges several sorted files, keeps the newest value for each key, and drops overwritten values and tombstones when it is safe. Size-tiered compaction favors write throughput by merging larger groups less often. Leveled compaction keeps files in size-bounded levels and usually gives cheaper reads at the cost of more rewriting.

This shape makes the foreground write simple: append to the log and update memory. It also creates a second workload that the operator must observe. Compaction consumes disk bandwidth, CPU, temporary space, and sometimes read capacity.

## A B-tree keeps the key ordered in place

A B-tree divides the key space into fixed-size pages. The root points to pages for key ranges; those pages point to leaves containing the records. A lookup follows one page at each level. A tree with only a few levels can serve point reads with predictable work, and the ordered leaves make range scans straightforward.

An update searches for the leaf page, changes it, and eventually writes the page back. An insert into a full page splits it and updates the parent; a split can travel to the root. A write-ahead log records the change before the page is flushed, so recovery can repair a tree after a crash or a torn page.

The B-tree’s cost is visible in the foreground path. A 1 KiB record may require a 4 KiB page write, even when only a small part of that page changed, and the WAL adds another copy of the change. Cache hits and batching reduce the physical I/O, but scattered keys still create random page pressure.

## One thousand writes reveal the accounting

Use a deliberately small model: 1,000 points × 1 KiB gives 1 MiB of logical data. Suppose the B-tree’s scattered keys touch a different 4 KiB page for each write, and ignore page splits for the moment. The tree writes roughly 4 MiB of pages. The WAL adds another 1 MiB, for about 5 MiB of device writes.

Now give the LSM-tree one memtable flush and one compaction pass. The WAL writes 1 MiB, the memtable becomes a 1 MiB SSTable, and compaction rewrites that data once. The total is about 3 MiB. In this toy case the LSM-tree has lower write amplification because it writes large sorted runs instead of rewriting a whole page for every small change.

Those figures are not promises. More compaction levels can rewrite a value several times. A B-tree may update a hot page repeatedly from memory, while an LSM-tree may stall if its compaction debt grows. The point is to make the accounting explicit: logical bytes, WAL bytes, page or run bytes, and background rewrites are different quantities.

## Compaction moves the cost into the background

Suppose the metrics stream grows faster than compaction can merge SSTables. Immutable files accumulate and the memtable fills. Many LSM implementations apply backpressure at this boundary: they slow or suspend new work until enough data has been flushed. The symptom is a latency spike in the ingest path, even though the application did not change its request rate.

The repair is operational, not rhetorical. Measure the oldest pending compaction, the number and size of files in each level, bytes written by compaction, and the time spent waiting for write capacity. Choose a compaction strategy that matches the read/write mix, keep enough disk headroom for temporary files, and test the system after it has reached steady state.

B-trees have different background problems. Deletes and page splits can leave fragmented pages, and a database may need a vacuum or rebuild process to reclaim space. A write-heavy workload can also create contention around hot pages. The work is still real; it simply appears as page maintenance and random writes instead of sorted-file merging.

## Reads expose the other half of the trade-off

For a point lookup, a B-tree normally follows a short, stable path from root to leaf. An LSM lookup may consult the memtable and several SSTables, although sparse indexes, Bloom filters, caching, and leveled compaction reduce the work. A missing key can be especially expensive if the filters and indexes cannot rule it out early.

Range queries favor the B-tree’s ordered leaves. An LSM-tree can scan sorted SSTables too, but it must scan the relevant range in several files and merge the results. Bloom filters do not remove that work because a range contains many possible keys rather than one hashable key.

The right comparison is therefore a workload trace, not a slogan. Measure point-read p99, range-scan latency, ingest p99 during compaction, bytes written per logical byte, disk space during a compaction, and recovery time after a crash. Run the test long enough for background work to reach its normal rate.

## Choose the cost you can operate

An LSM-tree is a good candidate when the workload has high write volume, scattered updates, and enough tolerance for background compaction. It can turn small random writes into larger sequential runs and often compress those runs well. The team must be ready to tune compaction, watch write amplification, and explain read behavior across several files.

A B-tree is a good candidate when point and range reads need predictable paths, when updates are moderate or concentrated in cache, and when the database’s transactional behavior benefits from in-place ordered pages. The team must budget for WAL traffic, random writes, page splits, and space maintenance.

Real systems also mix the ideas. An engine can use B-trees for some indexes and LSM-style files for others, or merge multiple trees as part of its write path. The decision is not “which structure is modern?” It is which structure makes the workload’s dominant cost visible, bounded, and repairable.

## Sources

- [Storage and Retrieval — Designing Data-Intensive Applications, 2nd edition](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/ch04.html) — Martin Kleppmann and Chris Riccomini, O’Reilly Media, Chapter 4.
- [The Log-Structured Merge-Tree (LSM-Tree)](https://www.cs.umb.edu/~poneil/lsmtree.pdf) — Patrick O’Neil, Edward Cheng, Dieter Gawlick, and Elizabeth O’Neil, Acta Informatica, 1996.
- [Compaction](https://github.com/facebook/rocksdb/wiki/Compaction) — RocksDB documentation.
- [B-Tree Indexes](https://www.postgresql.org/docs/current/btree.html) — PostgreSQL documentation.
- [The SQLite B-Tree Module](https://www.sqlite.org/btreemodule.html) — SQLite documentation.
- [Bigtable: A Distributed Storage System for Structured Data](https://research.google/pubs/bigtable-a-distributed-storage-system-for-structured-data/) — Fay Chang et al., Google Research, 2006.
