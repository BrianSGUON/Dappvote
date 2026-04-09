import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VoteModule = buildModule("VoteModule", (m) => {
  const candidates = ["Alice", "Bob", "Charlie"];

  const vote = m.contract("Vote", [candidates]);

  return { vote };
});

export default VoteModule;