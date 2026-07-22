import { getWalletTokens } from "./moralis.js";
import { calculateRiskScore } from "../utils/riskScore.js";
import { buildWalletPrompt } from "../prompts/walletPrompt.js";
import { generateAIReport } from "./ai.js";


export async function buildPremiumReport(wallet) {


  const tokens =
    await getWalletTokens(
      wallet,
      "0x2105"
    );



  const risk =
    calculateRiskScore(tokens);



  const prompt =
    buildWalletPrompt({

      wallet,

      chain: "Base",

      tokenCount:
        tokens.length,

      riskScore:
        risk.score,

      riskLevel:
        risk.level,

      riskReasons:
        risk.reasons || [],

      tokens,

    });



  const report =
    await generateAIReport(prompt);



  return {

    risk: {

      score:
        risk.score,

      level:
        risk.level,

      reasons:
        risk.reasons,

    },


    portfolio: {

      tokenCount:
        tokens.length,

      tokens,

    },


    aiReport:
      report,

  };


}