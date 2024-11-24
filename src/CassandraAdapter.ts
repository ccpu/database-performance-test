import { Client, types } from "cassandra-driver";
import { DatabaseAdapter, DatabaseConfig, TestRow } from "./types";

// Cassandra adapter
export class CassandraAdapter implements DatabaseAdapter {
  private client: Client;
  private readonly tableName = "performance_test";

  constructor(private config: DatabaseConfig["cassandra"]) {
    this.client = new Client(config);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.shutdown();
  }

  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id UUID PRIMARY KEY,
        data_field1 VARCHAR,
        data_field2 INT,
        data_field3 TIMESTAMP,
        data_field4 TEXT
      )
    `;
    await this.client.execute(query);
  }

  async insert(data: TestRow): Promise<void> {
    const query = `
      INSERT INTO ${this.tableName} (id, data_field1, data_field2, data_field3, data_field4)
      VALUES (?, ?, ?, ?, ?)
    `;
    await this.client.execute(
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

  getName(): string {
    return "Cassandra";
  }
}
