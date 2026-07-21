export async function signMessage(walletClient, message) {

  if (!walletClient) {
    throw new Error("Wallet client bulunamadı.");
  }


  return await walletClient.signMessage({
    message,
  });

}



export function getWalletAddress(account) {

  if (!account) return null;

  return account.address;

}



export function isValidAddress(address) {

  if (!address) return false;

  return /^0x[a-fA-F0-9]{40}$/.test(address);

}