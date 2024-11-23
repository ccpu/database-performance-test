import { Client } from "cassandra-driver";
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

interface TestRow {
  id: string;
  dataField1: string;
  dataField2: number;
  dataField3: Date;
  dataField4: string;
}

interface DatabaseConfig {
  cassandra: any;
  tidb: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
    ssl: {
      // Use the appropriate certificates if required
      rejectUnauthorized: true; // or false based on your needs
    };
  };
}

const config: DatabaseConfig = {
  cassandra: {
    cloud: {
      secureConnectBundle: "secure-connect-db-test.zip",
    },
    credentials: {
      username: "",
      password: "",
    },
    keyspace: "test",
  },
  tidb: {
    host: "",
    user: "",
    password: "",
    database: "",
    port: 4000,
    ssl: {
      // Use the appropriate certificates if required
      rejectUnauthorized: true, // or false based on your needs
    },
  },
};

function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

function generateRow(): TestRow {
  return {
    id: uuidv4(),
    dataField1: randomString(50),
    dataField2: Math.floor(Math.random() * 1000) + 1,
    dataField3: new Date(),
    dataField4: randomString(200),
  };
}

class DatabaseTester {
  private cassandraClient: Client;
  private tidbConnection: mysql.Connection | null = null;
  private readonly tableName = "performance_test";

  constructor() {
    this.cassandraClient = new Client(config.cassandra);
  }

  private async createCassandraTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id UUID PRIMARY KEY,
        data_field1 VARCHAR,
        data_field2 INT,
        data_field3 TIMESTAMP,
        data_field4 TEXT
      )
    `;
    await this.cassandraClient.execute(query);
  }

  private async createTiDBTable(): Promise<void> {
    if (!this.tidbConnection)
      throw new Error("TiDB connection not initialized");

    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id CHAR(36) PRIMARY KEY,
        data_field1 VARCHAR(100),
        data_field2 INT,
        data_field3 TIMESTAMP,
        data_field4 TEXT
      )
    `;
    await this.tidbConnection.execute(query);
  }

  private async testCassandraConnection(): Promise<void> {
    try {
      await this.cassandraClient.connect();
      console.log("Successfully connected to Cassandra");

      // Test if keyspace exists
      const keyspaceQuery = `
        SELECT keyspace_name
        FROM system_schema.keyspaces
        WHERE keyspace_name = ?
      `;
      const keyspaceResult = await this.cassandraClient.execute(keyspaceQuery, [
        config.cassandra.keyspace,
      ]);

      if (keyspaceResult.rows.length === 0) {
        throw new Error(`Keyspace ${config.cassandra.keyspace} does not exist`);
      }

      // Test if table exists and create if it doesn't
      await this.createCassandraTable();
      console.log("Cassandra table verified/created successfully");
    } catch (error) {
      console.error("Cassandra connection test failed:", error);
      throw error;
    }
  }

  private async testTiDBConnection(): Promise<void> {
    try {
      this.tidbConnection = await mysql.createConnection(config.tidb);
      console.log("Successfully connected to TiDB");

      // Test the connection
      await this.tidbConnection.query("SELECT 1");

      // Test if database exists
      await this.tidbConnection.query(`USE ${config.tidb.database}`);

      // Create table if it doesn't exist
      await this.createTiDBTable();
      console.log("TiDB table verified/created successfully");
    } catch (error) {
      console.error("TiDB connection test failed:", error);
      throw error;
    }
  }

  async init(): Promise<void> {
    console.log("Testing database connections and tables...");

    try {
      await this.testCassandraConnection();
      await this.testTiDBConnection();
      console.log("All database connections and tables verified successfully");
    } catch (error) {
      await this.cleanup();
      throw new Error(
        `Database initialization failed: ${(error as Error).message}`
      );
    }
  }

  async insertCassandra(data: TestRow): Promise<void> {
    const query = `
      INSERT INTO ${this.tableName} (id, data_field1, data_field2, data_field3, data_field4)
      VALUES (?, ?, ?, ?, ?)
    `;

    await this.cassandraClient.execute(
      query,
      [
        data.id,
        data.dataField1,
        data.dataField2,
        data.dataField3,
        data.dataField4,
      ],
      { prepare: true }
    );
  }

  async insertTidb(data: TestRow): Promise<void> {
    if (!this.tidbConnection) {
      throw new Error("TiDB connection not initialized");
    }

    const query = `
      INSERT INTO ${this.tableName} (id, data_field1, data_field2, data_field3, data_field4)
      VALUES (?, ?, ?, ?, ?)
    `;

    await this.tidbConnection.execute(query, [
      data.id,
      data.dataField1,
      data.dataField2,
      data.dataField3,
      data.dataField4,
    ]);
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async runTest(dbType: "cassandra" | "tidb"): Promise<number> {
    const totalTime: number[] = [];
    const batchSize = 1000;
    const sleepTime = 20; // 20ms
    const totalBatches = 10;

    console.log(
      `Starting ${dbType} test - ${totalBatches} batches of ${batchSize} rows each`
    );

    for (let batch = 0; batch < totalBatches; batch++) {
      const batchStartTime = process.hrtime();

      const rows = Array.from({ length: batchSize }, () => generateRow());

      const promises = rows.map((row) =>
        dbType === "cassandra"
          ? this.insertCassandra(row)
          : this.insertTidb(row)
      );

      await Promise.all(promises);

      const [seconds, nanoseconds] = process.hrtime(batchStartTime);
      const batchDuration = seconds + nanoseconds / 1e9;
      totalTime.push(batchDuration);

      console.log(
        `Batch ${
          batch + 1
        }/${totalBatches} completed in ${batchDuration.toFixed(3)}s`
      );

      await this.sleep(sleepTime);
    }

    return totalTime.reduce((a, b) => a + b, 0) / totalTime.length;
  }

  async cleanup(): Promise<void> {
    console.log("Cleaning up database connections...");

    if (this.cassandraClient) {
      try {
        await this.cassandraClient.shutdown();
        console.log("Cassandra connection closed");
      } catch (error) {
        console.error("Error closing Cassandra connection:", error);
      }
    }

    if (this.tidbConnection) {
      try {
        await this.tidbConnection.end();
        console.log("TiDB connection closed");
      } catch (error) {
        console.error("Error closing TiDB connection:", error);
      }
    }
  }
}

async function main() {
  const tester = new DatabaseTester();

  try {
    console.log("Initializing database connections and verifying tables...");
    await tester.init();

    // Test Cassandra
    console.log("\nTesting Cassandra...");
    const cassandraAvgTime = await tester.runTest("cassandra");
    console.log(
      `Cassandra average time per 1000 inserts: ${cassandraAvgTime.toFixed(
        3
      )} seconds`
    );

    // Test TiDB
    console.log("\nTesting TiDB...");
    const tidbAvgTime = await tester.runTest("tidb");
    console.log(
      `TiDB average time per 1000 inserts: ${tidbAvgTime.toFixed(3)} seconds`
    );
  } catch (error) {
    console.error("Error during testing:", error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT. Cleaning up...");
  const tester = new DatabaseTester();
  await tester.cleanup();
  process.exit(0);
});

// Run the test
main().catch(console.error);
