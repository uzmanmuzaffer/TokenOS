export function buildPortfolioSummary(results = []) {
  const successfulChains = results.filter(
    (chain) => chain.success
  );

  const totalChains = successfulChains.length;

  let totalTokens = 0;

  let largestHolding = null;

  let largestBalance = 0;

  const chains = [];

  for (const chain of successfulChains) {
    const tokens = chain.tokens || [];

    totalTokens += tokens.length;

    chains.push({
      chain: chain.chain,
      tokenCount: tokens.length,
    });

    for (const token of tokens) {
      const balance = Number(token.balance || 0);

      if (balance > largestBalance) {
        largestBalance = balance;

        largestHolding = {
          symbol: token.symbol,
          name: token.name,
          balance,
          chain: chain.chain,
        };
      }
    }
  }

  return {
    totalChains,
    totalTokens,
    largestHolding,
    chains,
  };
}