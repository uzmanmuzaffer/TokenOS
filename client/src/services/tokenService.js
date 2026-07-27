import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

export const client = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

export async function getTokenInfo() {
  try {
    const blockNumber = await client.getBlockNumber();

    console.log("Base bağlantısı başarılı.");
    console.log("Son blok:", blockNumber.toString());

    return {
      name: "TokenOS",
      symbol: "TOS",
      totalSupply: "1000000000",
    };
  } catch (error) {
    console.error(error);

    return {
      name: "Error",
      symbol: "ERR",
      totalSupply: "0",
    };
  }
}

export async function getTokenBalance() {
  return "0";
}