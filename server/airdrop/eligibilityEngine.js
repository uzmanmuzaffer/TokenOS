/**
 * TokenOS Eligibility Engine
 *
 * Amaç:
 * Airdrop kriterleri ile wallet aktivitesini
 * karşılaştırmak.
 */

function getWalletTransactionCount(wallet) {
  return Number(
    wallet?.transactionCount || 0
  );
}

function getWalletProtocolCount(wallet) {
  return Number(
    wallet?.protocolCount || 0
  );
}

function getWalletChains(wallet) {
  return Array.isArray(wallet?.chains)
    ? wallet.chains
    : [];
}

export function evaluateEligibility(
  airdrop,
  wallet
) {
  if (!airdrop || !wallet) {
    return {
      eligible: false,
      confidence: 0,
      status: "unknown",
      reasons: [],
    };
  }

  const rules =
    airdrop.eligibility?.rules || [];

  if (rules.length === 0) {
    return {
      eligible: false,
      confidence: 0,
      status: "potential",
      reasons: [
        "Eligibility rules are not yet available.",
      ],
    };
  }

  let passed = 0;
  const reasons = [];

  for (const rule of rules) {
    switch (rule.type) {
      case "min_transactions": {
        const count =
          getWalletTransactionCount(wallet);

        if (count >= Number(rule.value)) {
          passed++;

          reasons.push(
            `Transaction count ${count} >= ${rule.value}.`
          );
        } else {
          reasons.push(
            `Transaction count ${count} < ${rule.value}.`
          );
        }

        break;
      }

      case "min_protocols": {
        const count =
          getWalletProtocolCount(wallet);

        if (count >= Number(rule.value)) {
          passed++;

          reasons.push(
            `Protocol count ${count} >= ${rule.value}.`
          );
        } else {
          reasons.push(
            `Protocol count ${count} < ${rule.value}.`
          );
        }

        break;
      }

      case "required_chain": {
        const chains =
          getWalletChains(wallet);

        if (
          chains.includes(rule.value)
        ) {
          passed++;

          reasons.push(
            `Wallet used required chain: ${rule.value}.`
          );
        } else {
          reasons.push(
            `Required chain not detected: ${rule.value}.`
          );
        }

        break;
      }

      default:
        reasons.push(
          `Unknown rule type: ${rule.type}.`
        );
    }
  }

  const confidence =
    Math.round(
      (passed / rules.length) * 100
    );

  let status = "potential";

  if (confidence === 100) {
    status = "eligible";
  } else if (confidence >= 60) {
    status = "likely";
  } else if (confidence > 0) {
    status = "unlikely";
  } else {
    status = "not_eligible";
  }

  return {
    eligible: confidence === 100,
    confidence,
    status,
    passedRules: passed,
    totalRules: rules.length,
    reasons,
  };
}