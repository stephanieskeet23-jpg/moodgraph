import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'moodgraph.db');

let db = null;

export async function initDb() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      image_url TEXT,
      position_x REAL DEFAULT 0,
      position_y REAL DEFAULT 0,
      color TEXT DEFAULT '#fef08a',
      width INTEGER DEFAULT 200,
      height INTEGER DEFAULT 200,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    )
  `);

  // Add title column if it doesn't exist (migration for existing databases)
  try {
    db.run(`ALTER TABLE notes ADD COLUMN title TEXT DEFAULT ''`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Create default board if none exists
  const result = db.exec('SELECT COUNT(*) as count FROM boards');
  const count = result[0]?.values[0]?.[0] || 0;
  if (count === 0) {
    db.run('INSERT INTO boards (name, category) VALUES (?, ?)', ['My Vision Board', 'personal']);
    saveDb();
  }

  return db;
}

export function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

export function getDb() {
  return db;
}

// Helper to run queries and return results as objects
export function all(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error('Query error:', sql, error);
    return [];
  }
}

export function get(sql, params = []) {
  const results = all(sql, params);
  return results[0] || null;
}

export function run(sql, params = []) {
  try {
    db.run(sql, params);
    saveDb();
    // Get last insert rowid using a prepared statement
    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return { lastInsertRowid: result.id };
  } catch (error) {
    console.error('Run error:', sql, error);
    return { lastInsertRowid: null };
  }
}

export function runWithChanges(sql, params = []) {
  try {
    db.run(sql, params);
    saveDb();
    const changes = db.getRowsModified();
    return { changes };
  } catch (error) {
    console.error('Run error:', sql, error);
    return { changes: 0 };
  }
}
