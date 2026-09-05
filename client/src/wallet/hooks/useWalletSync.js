import { useEffect, useRef } from "react";
import { useWallet } from "./useWallet";
import useWalletStore from "../../store/walletStore";

export default function useWalletSync() {
  const { address, isConnected } = useWallet();
  const setWallet = useWalletStore((s) => s.setWallet);
  const analyze = useWalletStore((s) => s.analyze);
  const scanned = useRef("");

  useEffect(() => {
    if (!isConnected || !address) return;
    setWallet(address);
    if (scanned.current === address) return;
    scanned.current = address;
    analyze(address);
  }, [address, isConnected, setWallet, analyze]);
}