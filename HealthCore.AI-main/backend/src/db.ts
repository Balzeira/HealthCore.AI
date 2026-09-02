import initSqlJs from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const seedPath = path.join(__dirname, '../database/seed.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  db.run(schemaSql);
  db.run(seedSql);

  console.log('Database initialized with schema and seed data.');
  
  return db;
}
