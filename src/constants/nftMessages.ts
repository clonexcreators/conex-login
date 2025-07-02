export const NFT_MESSAGES = {
  // Scanning States
  scanning: "MULTI-PROVIDER VERIFICATION...",
  alchemyCheck: "CHECKING ALCHEMY...",
  moralisCheck: "CHECKING MORALIS...", 
  etherscanCheck: "VERIFYING ON BLOCKCHAIN...",
  blockchainVerifying: "BLOCKCHAIN VERIFICATION...",
  delegationCheck: "VERIFYING DELEGATIONS...",
  
  // Success States
  alchemySuccess: "ALCHEMY VERIFIED",
  moralisSuccess: "MORALIS VERIFIED",
  etherscanSuccess: "BLOCKCHAIN VERIFIED",
  blockchainConfirmed: "OWNERSHIP CONFIRMED ON-CHAIN",
  
  // Fallback States
  alchemyFailed: "ALCHEMY DOWN - TRYING MORALIS",
  moralisFailed: "MORALIS DOWN - TRYING ETHERSCAN",
  etherscanFailed: "ETHERSCAN DOWN - USING CACHE",
  allProvidersFailed: "ALL PROVIDERS DOWN - TRY AGAIN",
  
  // Results
  clonexFound: "CLONEX DETECTED",
  animusFound: "ANIMUS DETECTED", 
  delegatedFound: "DELEGATED NFTS FOUND",
  blockchainVerified: "BLOCKCHAIN OWNERSHIP VERIFIED",
  bothFound: "FULL ECOSYSTEM ACCESS",
  noneFound: "NO CLONES FOUND - GET SOME",
  verificationComplete: "MULTI-PROVIDER VERIFICATION COMPLETE",
  
  // Status
  collectorStatus: "COLLECTOR STATUS: ACTIVE",
  modStatus: "MOD STATUS: ACTIVE",
  ecosystemStatus: "ECOSYSTEM NATIVE CONFIRMED"
};