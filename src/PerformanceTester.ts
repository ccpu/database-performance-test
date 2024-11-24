import { DatabaseAdapter } from "./types";
import { dataGenerator } from "./utils";

// Performance tester
export class PerformanceTester {
  private static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async runTest(adapter: DatabaseAdapter): Promise<number> {
    const totalTime: number[] = [];
    const batchSize = 1000;
    const sleepTime = 20;
    const totalBatches = 10;

    console.log(
      `Starting ${adapter.getName()} test - ${totalBatches} batches of ${batchSize} rows each`
    );

    try {
      await adapter.connect();
      await adapter.createTable();

      for (let batch = 0; batch < totalBatches; batch++) {
        const batchStartTime = process.hrtime();
        const rows = Array.from({ length: batchSize }, () =>
          dataGenerator.generateRow()
        );

        await Promise.all(rows.map((row) => adapter.insert(row)));

        const [seconds, nanoseconds] = process.hrtime(batchStartTime);
        const batchDuration = seconds + nanoseconds / 1e9;
        totalTime.push(batchDuration);

        console.log(
          `Batch ${
            batch + 1
          }/${totalBatches} completed in ${batchDuration.toFixed(3)}s`
        );
        await PerformanceTester.sleep(sleepTime);
      }

      return totalTime.reduce((a, b) => a + b, 0) / totalTime.length;
    } finally {
      await adapter.disconnect();
    }
  }
}
