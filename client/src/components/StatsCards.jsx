import { useEffect, useState } from "react";

import {
  FaCoins,
  FaDatabase,
  FaWallet,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";


import { getTokenInfo } from "../services/tokenService";
import { getTokenMarket } from "../services/dexscreener";



function StatsCards() {


const [tokenInfo,setTokenInfo] = useState(null);

const [market,setMarket] = useState({
priceUsd:0,
liquidity:0,
marketCap:0,
volume24h:0
});



useEffect(()=>{


async function load(){


try{


const token =
await getTokenInfo();


setTokenInfo(token);



try{


const marketData =
await getTokenMarket();



if(marketData){

setMarket({

priceUsd:
Number(marketData.priceUsd || 0),

liquidity:
Number(marketData.liquidity || 0),

marketCap:
Number(marketData.marketCap || 0),

volume24h:
Number(marketData.volume24h || 0),

});


}



}catch(e){

console.log(
"Market data unavailable"
);

}



}catch(error){

console.error(
"Stats error:",
error
);


}



}


load();



const timer =
setInterval(
load,
30000
);



return ()=>clearInterval(timer);


},[]);




const safeSupply =
Number(
tokenInfo?.totalSupply || 0
);



const stats=[


{
title:"Token",

value:
tokenInfo?.name || "TokenOS",

change:
tokenInfo?.symbol || "TOS",

icon:<FaCoins/>,

color:"text-cyan-400"

},



{
title:"Price",

value:

market.priceUsd > 0

?

`$${market.priceUsd.toFixed(6)}`

:

"Not Indexed",

change:"Live",

icon:<FaChartLine/>,

color:"text-green-400"

},



{
title:"Liquidity",

value:

market.liquidity > 0

?

`$${market.liquidity.toLocaleString("tr-TR")}`

:

"Not Indexed",

change:"DEX",

icon:<FaWallet/>,

color:"text-orange-400"

},



{
title:"Market Cap",

value:

market.marketCap >0

?

`$${market.marketCap.toLocaleString("tr-TR")}`

:

"Not Indexed",

change:"Live",

icon:<FaDatabase/>,

color:"text-purple-400"

},



{
title:"Total Supply",

value:

safeSupply >0

?

safeSupply.toLocaleString("tr-TR")

:

"0",

change:"TOS",

icon:<FaDatabase/>,

color:"text-cyan-400"

},



{
title:"24H Volume",

value:

market.volume24h >0

?

`$${market.volume24h.toLocaleString("tr-TR")}`

:

"$0",

change:"Volume",

icon:<FaChartLine/>,

color:"text-blue-400"

},



{
title:"Network",

value:"Base",

change:"Mainnet",

icon:<FaWallet/>,

color:"text-green-400"

},



{
title:"Contract",

value:"Verified",

change:"BaseScan",

icon:<FaCheckCircle/>,

color:"text-yellow-400"

}



];




return (

<div className="
grid
grid-cols-1
sm:grid-cols-2
xl:grid-cols-4
gap-6
">


{stats.map((item)=>(


<div

key={item.title}

className="
bg-slate-900/80
border
border-slate-800
rounded-2xl
p-6
hover:border-cyan-500/40
transition-all
duration-300
hover:-translate-y-1
"

>


<div className="flex justify-between items-start">


<div>

<p className="text-sm text-slate-400">

{item.title}

</p>


<h2 className="text-3xl font-bold text-white mt-3 break-all">

{item.value}

</h2>


<p className="text-sm text-green-400 mt-2">

{item.change}

</p>


</div>


<div className={`

text-3xl

${item.color}

bg-slate-800

p-3

rounded-xl

`}>

{item.icon}

</div>


</div>


</div>


))}


</div>

);


}


export default StatsCards;