/**
 * TokenOS Airdrop Valuation Engine
 *
 * allocation × token price = USD value
 */

export function calculateUsdValue(
  amount,
  price
) {
  const numericAmount = Number(amount || 0);
  const numericPrice = Number(price || 0);

  if (
    !Number.isFinite(numericAmount) ||
    !Number.isFinite(numericPrice)
  ) {
    return 0;
  }

  return Number(
    (numericAmount * numericPrice).toFixed(2)
  );
}

export function calculateRemainingAllocation(
  total,
  claimed
) {
  const totalAmount = Number(total || 0);
  const claimedAmount = Number(claimed || 0);

  if (
    !Number.isFinite(totalAmount) ||
    !Number.isFinite(claimedAmount)
  ) {
    return 0;
  }

  return Math.max(
    0,
    totalAmount - claimedAmount
  );
}

export function calculateAirdropValue(
  airdrop
) {
  if (!airdrop) {
    return {
      amount: 0,
      price: 0,
      usdValue: 0,
    };
  }

  const total =
    Number(
      airdrop.allocation?.total || 0
    );

  const claimed =
    Number(
      airdrop.allocation?.claimed || 0
    );

  const remaining =
    calculateRemainingAllocation(
      total,
      claimed
    );

  const price =
    Number(
      airdrop.pricing?.usd || 0
    );

  return {
    amount: remaining,
    price,
    usdValue: calculateUsdValue(
      remaining,
      price
    ),
  };
}