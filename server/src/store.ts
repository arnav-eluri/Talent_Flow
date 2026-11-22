import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/talentflow.db');
const WASM_PATH = path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any;

export async function initDb(): Promise<void> {
  const SQL = await initSqlJs({ locateFile: () => WASM_PATH });
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
    db.run('CREATE TABLE IF NOT EXISTS store (key TEXT PRIMARY KEY, data TEXT NOT NULL)');
    _flush();
  }
}

function _flush(): void {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

export function load<T>(name: string, seed: T[]): T[] {
  const result = db.exec('SELECT data FROM store WHERE key = ?', [name]);
  if (result.length && result[0].values.length) {
    return JSON.parse(result[0].values[0][0] as string);
  }
  persist(name, seed);
  return [...seed];
}

export function persist(name: string, data: unknown): void {
  db.run('INSERT OR REPLACE INTO store (key, data) VALUES (?, ?)', [name, JSON.stringify(data)]);
  _flush();
}
