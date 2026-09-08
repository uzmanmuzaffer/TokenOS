import { getArcWallet } from "./server/providers/arc/index.js";

const wallet = process.argv[2];

if (!wallet) {
  console.error("Wallet adresi gerekli.");
  process.exit(1);
}

const result = await getArcWallet(wallet);

console.dir(result, {
  depth: null,
});
