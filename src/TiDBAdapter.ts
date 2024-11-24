import { DatabaseAdapter, DatabaseConfig, TestRow } from "./types";
import mysql from "mysql2/promise";

// TiDB adapter
export class TiDBAdapter implements DatabaseAdapter {
  private connection: mysql.Connection | null = null;
  private readonly tableName = "performance_test";

  constructor(private config: DatabaseConfig["tidb"]) {}

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection(this.config);
  }

  async disconnect(): Promise<void> {
    await this.connection?.end();
  }

  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id CHAR(36) PRIMARY KEY,
        data_field1 VARCHAR(100),
        data_field2 INT,
        data_field3 TIMESTAMP,
        data_field4 TEXT
      )
    `;
    await this.connection?.execute(query);
  }

  async insert(data: TestRow): Promise<void> {
    const query = `
      INSERT INTO ${this.tableName} (id, data_field1, data_field2, data_field3, data_field4)
      VALUES (?, ?, ?, ?, ?)
    `;
    await this.connection?.execute(query, [
      data.id,
      data.dataField1,
      data.dataField2,
      data.dataField3,
      data.dataField4,
    ]);
  }

  getName(): string {
    return "TiDB";
  }
}
