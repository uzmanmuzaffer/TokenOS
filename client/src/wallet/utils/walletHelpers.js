export function shortenAddress(address) {

  if (!address) return "";

  return `${address.slice(0, 6)}...${address.slice(-4)}`;

}



export function formatBalance(balance) {

  if (!balance) return "0";

  return Number(balance).toFixed(4);

}



export function getExplorerUrl(
  address,
  chainId
) {

  if (!address) return "";


  switch (chainId) {

    case 8453:

      return `https://basescan.org/address/${address}`;


    case 1:

      return `https://etherscan.io/address/${address}`;


    default:

      return "";

  }

}