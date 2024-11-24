import { CassandraAdapter } from "./CassandraAdapter";
import { DatabaseAdapter, DatabaseConfig, TestRow } from "./types";
import { TiDBAdapter } from "./TiDBAdapter";
import { CockroachAdapter } from "./CockroachAdapter";
import { dataGenerator } from "./utils";
import { PerformanceTester } from "./PerformanceTester";

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
      rejectUnauthorized: true,
    },
  },
  cockroach: {
    connectionString: "",
    ssl: {
      rejectUnauthorized: true,
    },
  },
};

// Database factory
class DatabaseFactory {
  static createAdapter(type: string): DatabaseAdapter {
    switch (type.toLowerCase()) {
      case "cassandra":
        return new CassandraAdapter(config.cassandra);
      case "tidb":
        return new TiDBAdapter(config.tidb);
      case "cockroach":
        return new CockroachAdapter(config.cockroach);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}

// Main execution
async function main() {
  const tester = new PerformanceTester();
  const databases = ["cockroach", "tidb", "cassandra"];

  for (const dbType of databases) {
    try {
      const adapter = DatabaseFactory.createAdapter(dbType);
      console.log(`\nTesting ${adapter.getName()}...`);
      const avgTime = await tester.runTest(adapter);
      console.log(
        `${adapter.getName()} average time per 1000 inserts: ${avgTime.toFixed(
          3
        )} seconds`
      );
    } catch (error) {
      console.error(`Error testing ${dbType}:`, error);
    }
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT. Exiting...");
  process.exit(0);
});

// Run the test
main().catch(console.error);
