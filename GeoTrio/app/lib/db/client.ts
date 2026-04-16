import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";
import { migrate } from "drizzle-orm/sql-js/migrator";
import initSqlJs, { type Database as SqlJsDatabase, type SqlJsStatic } from "sql.js";

import * as schema from "@/lib/db/schema";

const SQLITE_DIR_PATH = path.join(process.cwd(), ".data");
const SQLITE_FILE_PATH = path.join(SQLITE_DIR_PATH, "stride.sqlite");
const DRIZZLE_MIGRATIONS_PATH = path.join(process.cwd(), "drizzle");
const SQL_WASM_PATH = path.join(process.cwd(), "node_modules", "sql.js", "dist");

type DatabaseStore = {
  sqlite: SqlJsDatabase;
  db: SQLJsDatabase<typeof schema>;
};

let sqlJsPromise: Promise<SqlJsStatic> | null = null;
let storePromise: Promise<DatabaseStore> | null = null;
let writeQueue = Promise.resolve();

function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: (file: string) => path.join(SQL_WASM_PATH, file),
    });
  }

  return sqlJsPromise;
}

async function createStore(): Promise<DatabaseStore> {
  await mkdir(SQLITE_DIR_PATH, { recursive: true });

  const SQL = await getSqlJs();
  const existing = await readFile(SQLITE_FILE_PATH).catch(() => null);
  const sqlite = existing ? new SQL.Database(existing) : new SQL.Database();
  const db = drizzle(sqlite, { schema });

  sqlite.run("PRAGMA foreign_keys = ON;");
  migrate(db, {
    migrationsFolder: DRIZZLE_MIGRATIONS_PATH,
  });

  return {
    sqlite,
    db,
  };
}

async function getStore() {
  if (!storePromise) {
    storePromise = createStore();
  }

  return storePromise;
}

async function persistStore(store: DatabaseStore) {
  const exported = store.sqlite.export();
  await writeFile(SQLITE_FILE_PATH, Buffer.from(exported));
}

export async function withDatabase<T>(
  callback: (store: DatabaseStore) => T | Promise<T>,
) {
  const store = await getStore();
  return callback(store);
}

export async function withDatabaseWrite<T>(
  callback: (store: DatabaseStore) => T | Promise<T>,
) {
  const operation = writeQueue.then(async () => {
    const store = await getStore();
    const result = await callback(store);
    await persistStore(store);
    return result;
  });

  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );

  return operation;
}
