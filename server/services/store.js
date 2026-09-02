import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "billing-store.json");

const emptyState = () => ({
  accounts: {},
  apiKeys: {},
  referrals: {},
  invoices: [],
  updatedAt: new Date().toISOString(),
});

let memory = emptyState();
let loaded = false;
let writeQueue = Promise.resolve();

async function ensureLoaded() {
  if (loaded) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, "utf8");
    memory = { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    memory = emptyState();
    await persist();
  }
  loaded = true;
}

async function persist() {
  memory.updatedAt = new Date().toISOString();
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(memory, null, 2), "utf8");
}

export async function readStore() {
  await ensureLoaded();
  return memory;
}

export async function updateStore(mutator) {
  await ensureLoaded();
  writeQueue = writeQueue.then(async () => {
    mutator(memory);
    await persist();
  });
  await writeQueue;
  return memory;
}