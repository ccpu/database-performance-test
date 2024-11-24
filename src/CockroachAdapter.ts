import { DatabaseAdapter, DatabaseConfig, TestRow } from "./types";
import pg from "pg"; // For CockroachDB

export class CockroachAdapter implements DatabaseAdapter {
  private client: pg.Client | null = null;
  private readonly tableName = "performance_test";

  constructor(private config: DatabaseConfig["cockroach"]) {}

  async connect(): Promise<void> {
    this.client = new pg.Client(this.config.connectionString);
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client?.end();
  }

  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id UUID PRIMARY KEY,
        data_field1 VARCHAR(100),
        data_field2 INT,
        data_field3 TIMESTAMP,
        data_field4 TEXT
      )
    `;
    await this.client?.query(query);
  }

  async insert(data: TestRow): Promise<void> {
    const query = `
      INSERT INTO ${this.tableName} (id, data_field1, data_field2, data_field3, data_field4)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await this.client?.query(query, [
      data.id,
      data.dataField1,
      data.dataField2,
      data.dataField3,
      data.dataField4,
    ]);
  }

  getName(): string {
    return "CockroachDB";
  }
}
