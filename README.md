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

## Results

### Cassandra Performance

- **Average Insert Time**: 0.090 seconds per 1000 rows
- **Throughput**: ~11,111 records per second
- **Batch Performance Range**: 0.072s - 0.190s
- **Best Batch Time**: 0.072s (Batch 4 & 6)
- **Worst Batch Time**: 0.190s (Batch 1)

### TiDB Performance

- **Average Insert Time**: 44.568 seconds per 1000 rows
- **Throughput**: ~22 records per second
- **Batch Performance Range**: 44.203s - 44.967s
- **Best Batch Time**: 44.203s (Batch 5)
- **Worst Batch Time**: 44.967s (Batch 2)

## Key Findings

1. Cassandra significantly outperformed TiDB in bulk insert operations
2. Cassandra showed consistent performance after the first batch
3. TiDB showed very consistent but much slower performance across all batches
4. Performance difference: Cassandra was approximately 495x faster than TiDB

## Recommendations

1. For high-throughput insert operations, Cassandra appears to be the better choice
2. Consider investigating TiDB's configuration for potential performance optimization
3. Further testing with different batch sizes might be beneficial for TiDB optimization

Note: These results are specific to the test environment and configuration. Performance may vary with different hardware, network conditions, and database configurations.
