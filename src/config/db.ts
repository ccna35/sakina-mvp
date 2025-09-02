import mysql from "mysql2/promise";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "sakina",
  connectionLimit: 10,
  timezone: "Z",
  dateStrings: true,
  waitForConnections: true,
  namedPlaceholders: true,
});
