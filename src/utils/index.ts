import { TestRow } from "../types";
import { v4 as uuidv4 } from "uuid";

// Data generation utilities
export const dataGenerator = {
  randomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  },

  generateRow(): TestRow {
    return {
      id: uuidv4(),
      dataField1: this.randomString(50),
      dataField2: Math.floor(Math.random() * 1000) + 1,
      dataField3: new Date(),
      dataField4: this.randomString(200),
    };
  },
};
