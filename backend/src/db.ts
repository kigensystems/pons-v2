// SQLite registry using Node's built-in driver. One file, WAL mode, uniqueness enforced by schema.
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS auth_nonces (
  nonce TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  content_type TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS launch_intents (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  target TEXT NOT NULL,
  calldata TEXT NOT NULL,
  value_wei TEXT NOT NULL,
  params_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  expected_economics TEXT NOT NULL,
  launch_config_id INTEGER NOT NULL,
  pair_token TEXT NOT NULL,
  token_params TEXT NOT NULL,
  terms TEXT NOT NULL,
  simulation TEXT,
  source_block INTEGER NOT NULL,
  status TEXT NOT NULL,
  failure TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (address, idempotency_key)
);
CREATE TABLE IF NOT EXISTS submissions (
  tx_hash TEXT PRIMARY KEY,
  intent_id TEXT NOT NULL REFERENCES launch_intents(id),
  state TEXT NOT NULL,
  detail TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  submitted_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS submissions_intent ON submissions(intent_id);
CREATE TABLE IF NOT EXISTS launches (
  chain_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  curve TEXT NOT NULL,
  factory TEXT NOT NULL,
  creator TEXT NOT NULL,
  creator_fee_recipient TEXT NOT NULL,
  intent_id TEXT NOT NULL UNIQUE REFERENCES launch_intents(id),
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  block_number INTEGER NOT NULL,
  block_hash TEXT NOT NULL,
  block_time INTEGER NOT NULL,
  launch_config_id INTEGER NOT NULL,
  pair_token TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  logo TEXT NOT NULL,
  description TEXT NOT NULL,
  creator_tax_bps INTEGER NOT NULL,
  buyback_enabled INTEGER NOT NULL,
  confirmation_state TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (chain_id, token),
  UNIQUE (chain_id, tx_hash, log_index)
);
CREATE TABLE IF NOT EXISTS market_snapshots (
  chain_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  kind TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  payload TEXT,
  observed_at INTEGER,
  retrieved_at INTEGER NOT NULL,
  error TEXT,
  PRIMARY KEY (chain_id, token, kind)
);
CREATE TABLE IF NOT EXISTS sync_cursors (
  scope TEXT PRIMARY KEY,
  block_number INTEGER NOT NULL,
  block_hash TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
`

export type Db = DatabaseSync

export function openDatabase(path: string): Db {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;')
  db.exec(SCHEMA)
  return db
}

export const now = () => Math.floor(Date.now() / 1000)
