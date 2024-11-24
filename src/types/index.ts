export interface TestRow {
  id: string;
  dataField1: string;
  dataField2: number;
  dataField3: Date;
  dataField4: string;
}

// Database adapter interface
export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  createTable(): Promise<void>;
  insert(data: TestRow): Promise<void>;
  getName(): string;
}

export interface DatabaseConfig {
  cassandra: {
    cloud: {
      secureConnectBundle: string;
    };
    credentials: {
      username: string;
      password: string;
    };
    keyspace: string;
  };
  tidb: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
    ssl: {
      rejectUnauthorized: boolean;
    };
  };
  cockroach: {
    connectionString: string;
    ssl?: {
      rejectUnauthorized: boolean;
    };
  };
}
