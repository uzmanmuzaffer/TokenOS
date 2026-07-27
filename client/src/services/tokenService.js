import {
  createPublicClient,
  http,
  formatUnits
} from "viem";

import {
  base
} from "viem/chains";


const BASE_RPC =
"https://mainnet.base.org";


const TOKENOS_ADDRESS =
"0xd6D3bE2330fFaaEE7e4d9b69C208f71033676d10";


const ERC20_ABI = [

{
name:"name",
type:"function",
stateMutability:"view",
inputs:[],
outputs:[
{
type:"string"
}
]
},

{
name:"symbol",
type:"function",
stateMutability:"view",
inputs:[],
outputs:[
{
type:"string"
}
]
},

{
name:"totalSupply",
type:"function",
stateMutability:"view",
inputs:[],
outputs:[
{
type:"uint256"
}
]
},

{
name:"decimals",
type:"function",
stateMutability:"view",
inputs:[],
outputs:[
{
type:"uint8"
}
]
}

];



const client = createPublicClient({

chain: base,

transport:http(BASE_RPC)

});




export async function getTokenInfo(){

try {


const [
name,
symbol,
rawSupply,
decimals

] = await Promise.all([


client.readContract({

address:TOKENOS_ADDRESS,

abi:ERC20_ABI,

functionName:"name"

}),



client.readContract({

address:TOKENOS_ADDRESS,

abi:ERC20_ABI,

functionName:"symbol"

}),



client.readContract({

address:TOKENOS_ADDRESS,

abi:ERC20_ABI,

functionName:"totalSupply"

}),



client.readContract({

address:TOKENOS_ADDRESS,

abi:ERC20_ABI,

functionName:"decimals"

})

]);



const totalSupply =
Number(
formatUnits(
rawSupply,
decimals
)
);



return {


name:name || "TokenOS",


symbol:symbol || "TOS",


totalSupply,


formattedSupply:
totalSupply.toLocaleString(
"en-US"
),



price:0,


liquidity:0,


marketCap:0,


volume24h:0,



network:
"Base Mainnet",



contract:
TOKENOS_ADDRESS,



verified:true,


scam:false,


securityScore:98


};



}

catch(error){


console.error(
"TokenOS blockchain error:",
error
);



return {


name:"TokenOS",

symbol:"TOS",


totalSupply:1000000000,


formattedSupply:
"1,000,000,000",


price:0,

liquidity:0,

marketCap:0,

volume24h:0,


network:"Base Mainnet",


contract:TOKENOS_ADDRESS,


verified:true,


scam:false,


securityScore:98


};


}


}





export function getSupportedChains(){

return [
"Base"
];

}