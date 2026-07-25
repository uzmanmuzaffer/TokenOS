import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenOSModule = buildModule("TokenOSModule", (m) => {
  const owner = m.getAccount(0);

  const token = m.contract("TokenOS", [owner]);

  return { token };
});

export default TokenOSModule;