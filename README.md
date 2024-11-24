# Database Performance Test Results Documentation

## Overview

This performance test compared the insert operations between Apache Cassandra and TiDB databases. The test involved inserting 1000 rows of data in 10 batches, with each row containing a UUID and random data fields.

## Test Configuration

- **Batch Size**: 1000 rows per batch
- **Number of Batches**: 10
- **Total Records**: 10,000 per database
- **Record Schema**:
  - UUID primary key
  - String field (50 chars)
  - Integer field
  - Timestamp field
  - Text field (200 chars)

## Schema

### TIDB

```sql
CREATE TABLE IF NOT EXISTS performance_test (
    id CHAR(36) PRIMARY KEY,
    data_field1 VARCHAR(100),
    data_field2 INT,
    data_field3 TIMESTAMP,
    data_field4 TEXT
);
```

### Cassandra

```sql
CREATE TABLE IF NOT EXISTS performance_test (
    id UUID PRIMARY KEY,
    data_field1 VARCHAR,
    data_field2 INT,
    data_field3 TIMESTAMP,
    data_field4 TEXT
);
```

### CockroachDB

```sql
CREATE TABLE IF NOT EXISTS performance_test (
    id UUID PRIMARY KEY,
    data_field1 VARCHAR(100),
    data_field2 INT,
    data_field3 TIMESTAMP,
    data_field4 TEXT
);
```

## Results

### Cassandra Performance

- **Average Insert Time**: 0.090 seconds per 1000 rows
- **Throughput**: ~11,111 records per second
- **Batch Performance Range**: 0.072s - 0.190s
- **Best Batch Time**: 0.072s (Batch 4 & 6)
- **Worst Batch Time**: 0.190s (Batch 1)
- **RU Used**: 10.0k~
- **Storage**: 2.88 MB

### TiDB Performance

- **Average Insert Time**: 44.568 seconds per 1000 rows
- **Throughput**: ~22 records per second
- **Batch Performance Range**: 44.203s - 44.967s
- **Best Batch Time**: 44.203s (Batch 5)
- **Worst Batch Time**: 44.967s (Batch 2)
- **RU Used**: 83K
- **Row-based Storage**: 5.35 MiB

### CockroachDB Performance

- **Average Insert Time**: 43.294 seconds per 1000 rows
- **Throughput**: ~22 records per second
- **Batch Performance Range**: 43.025s - 43.826s
- **Best Batch Time**: 43.025s (Batch 5)
- **Worst Batch Time**: 43.826s (Batch 2)
- **RU Used**: 128.95K
- **Storage**: 4 MiB

The Key Findings section should be updated to include:

## Key Findings

1. Cassandra significantly outperformed both TiDB and CockroachDB in bulk insert operations
2. Cassandra showed consistent performance after the first batch
3. Both TiDB and CockroachDB showed very consistent but much slower performance across all batches
4. Performance comparison:
   - Cassandra was approximately 495x faster than TiDB
   - Cassandra was approximately 481x faster than CockroachDB
   - CockroachDB and TiDB performed similarly, with CockroachDB slightly faster

The Recommendations section could be updated to:

## Recommendations

1. For high-throughput insert operations, Cassandra appears to be the better choice
2. Consider investigating TiDB and CockroachDB configurations for potential performance optimization
3. Further testing with different batch sizes might be beneficial for both TiDB and CockroachDB optimization
4. When choosing between TiDB and CockroachDB for bulk inserts, performance should not be the deciding factor as they perform similarly

Note: These results are specific to the test environment and configuration. Performance may vary with different hardware, network conditions, and database configurations.
