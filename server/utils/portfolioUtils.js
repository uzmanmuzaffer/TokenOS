export function buildPortfolioSummary(results = []) {
  const successfulChains = results.filter(
    (chain) => chain.success
  );

  const chains = [];
  const allTokens = [];

  let totalTokens = 0;
  let totalValue = 0;

  for (const chain of successfulChains) {
    const chainTokens = chain.tokens || [];

    totalTokens += chainTokens.length;

    chains.push({
      chain: chain.chain,
      tokenCount: chainTokens.length,
    });

    for (const token of chainTokens) {
      const balance = Number(token.balance_formatted ?? 0);
      const price = Number(token.usd_price ?? 0);

      if (
        !Number.isFinite(balance) ||
        !Number.isFinite(price)
      ) {
        continue;
      }

      const value = balance * price;

      totalValue += value;

      allTokens.push({
        chain: chain.chain,
        symbol: token.symbol,
        name: token.name,
        balance: Number(balance.toFixed(8)),
        price: Number(price.toFixed(8)),
        value: Number(value.toFixed(2)),
        logo: token.logo,
        address: token.token_address,
      });
    }
  }

  const tokens = allTokens
    .sort((a, b) => b.value - a.value)
    .map((token) => ({
      ...token,
      allocation:
        totalValue > 0
          ? Number(
              ((token.value / totalValue) * 100).toFixed(2)
            )
          : 0,
    }));

  const largestHolding =
    tokens.length > 0 ? tokens[0] : null;

  return {
    totalChains: successfulChains.length,
    totalTokens,
    totalValue: Number(totalValue.toFixed(2)),
    largestHolding,
    chains,
    tokens,
  };
}