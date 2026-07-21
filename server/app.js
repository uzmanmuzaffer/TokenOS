import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { x402Middleware } from "./providers/x402/index.js";

import premiumRoutes from "./routes/premium.js";
import newsRoutes from "./routes/news.js";

import {
  analyzeWallet as analyzeWalletEngine
} from "./engine/walletEngine.js";

import {
  buildPortfolio
} from "./engine/portfolioEngine.js";

import {
  calculateRiskScore
} from "./utils/riskScore.js";

import {
  getWalletTokens
} from "./services/moralis.js";

import {
  getMarketTokens
} from "./services/market.js";


dotenv.config({
  path:"./.env"
});


console.log("ENV:", {
  payTo: process.env.X402_PAY_TO,
  network: process.env.X402_NETWORK,
  facilitator: process.env.X402_FACILITATOR
});


console.log("ENV CHECK");

console.log(
"GROQ:",
process.env.GROQ_API_KEY ? "OK" : "EMPTY"
);

console.log(
"X402_PAY_TO:",
process.env.X402_PAY_TO
);

console.log(
"X402_NETWORK:",
process.env.X402_NETWORK
);

console.log(
"X402_FACILITATOR:",
process.env.X402_FACILITATOR
);

console.log(
"MORALIS_API_KEY:",
process.env.MORALIS_API_KEY ? "OK" : "EMPTY"
);



const app = express();

const PORT =
process.env.PORT || 5000;



// ===============================
// GLOBAL MIDDLEWARE
// ===============================

app.use(
cors()
);

app.use(
express.json()
);




// ===============================
// NEWS
// ===============================

app.use(
"/api/news",
newsRoutes
);





// ===============================
// PREMIUM AI REPORT
// X402 PAYMENT PROTECTED
// ===============================

app.use(
  "/api/premium",
  x402Middleware,
  premiumRoutes
);






// ===============================
// HEALTH CHECK
// ===============================

app.get(
"/",
(req,res)=>{

res.json({

success:true,

app:"TokenOS API",

version:"1.0.0",

status:"running"

});

});







// ===============================
// MARKET TOKENS
// ===============================

app.get(
"/api/tokens",

async(req,res)=>{

try{

const tokens =
await getMarketTokens();


res.json({

success:true,

count:
tokens.length,

tokens

});


}
catch(error){

console.error(
"Token API Error:",
error
);


res.status(500)
.json({

success:false,

error:error.message

});

}

});








// ===============================
// WALLET ANALYZER V1
// ===============================

app.post(
"/api/analyze",

async(req,res)=>{

try{

const {
wallet
}=req.body || {};


if(!wallet){

return res.status(400)
.json({

success:false,

error:
"Wallet address is required"

});

}



console.log(
"🔍 Analyzing:",
wallet
);



const tokens =
await getWalletTokens(
wallet,
"eth"
);



const risk =
calculateRiskScore(
tokens
);



res.json({

success:true,

wallet,

chain:
"Ethereum",

tokenCount:
tokens.length,


riskScore:
risk.score,


riskLevel:
risk.level,


riskDetails:{

stableTokens:
risk.stableTokens,


unknownTokens:
risk.unknownTokens

},


tokens

});


}
catch(error){


console.error(
"Analyze Error:",
error
);


res.status(500)
.json({

success:false,

error:error.message

});


}

});









// ===============================
// WALLET ENGINE V2
// MULTI CHAIN
// ===============================

app.post(
"/api/analyze-v2",

async(req,res)=>{


try{


const {
wallet
}=req.body || {};



if(!wallet){

return res.status(400)
.json({

success:false,

error:
"Wallet address is required"

});

}



console.log(
"🚀 Wallet Engine:",
wallet
);



const results =
await analyzeWalletEngine(
wallet
);



const portfolio =
buildPortfolio(
results
);



res.json({

success:true,

wallet,

analyzedChains:
results.length,


portfolio:
portfolio.portfolio,


results

});


}
catch(error){


console.error(
"Wallet Engine Error:",
error
);



res.status(500)
.json({

success:false,

error:error.message

});


}

});







// ===============================
// SERVER START
// ===============================

app.listen(
PORT,
()=>{

console.log(
`🚀 TokenOS Backend running on http://localhost:${PORT}`
);

});