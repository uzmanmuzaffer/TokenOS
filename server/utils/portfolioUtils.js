export function buildPortfolioSummary(results = []) {
  const successfulChains = results.filter((chain) => chain.success);

  const chains = [];
  const allTokens = [];

  let totalTokens = 0;
  let totalValue = 0;

  for (const chain of successfulChains) {
    const tokens = chain.tokens || [];

    totalTokens += tokens.length;

    chains.push({
      chain: chain.chain,
      tokenCount: tokens.length,
    });

    for (const token of tokens) {
      const balance = Number(token.balance_formatted || 0);
      const price = Number(token.usd_price || 0);
      const value = balance * price;

      totalValue += value;

      allTokens.push({
        chain: chain.chain,
        symbol: token.symbol,
        name: token.name,
        balance,
        price,
        value,
        logo: token.logo,
        address: token.token_address,
      });
    }
  }

  // En büyük varlık
  let largestHolding = null;

  if (allTokens.length > 0) {
    largestHolding = allTokens.reduce((largest, token) =>
      token.value > (largest?.value || 0) ? token : largest,
    null);
  }

  // Allocation hesapla
  const tokens = allTokens.map((token) => ({
    ...token,
    allocation:
      totalValue > 0
        ? Number(((token.value / totalValue) * 100).toFixed(2))
        : 0,
  }));

  return {
    totalChains: successfulChains.length,
    totalTokens,
    totalValue: Number(totalValue.toFixed(2)),
    largestHolding,
    chains,
    tokens,
  };
}