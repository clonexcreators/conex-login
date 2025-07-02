export const PUNK_MESSAGES = {
  // Connection States
  connect: "TAP IN",
  connecting: "CONNECTING...",
  connected: "CONNECTED",
  
  // Authentication Flow
  challenge: "CLONEX DNA SCAN",
  signing: "DNA SEQUENCING...",
  authenticating: "MOLECULAR ENHANCEMENTS DETECTED...",
  success: "ACCESS GRANTED",
  authenticated: "YOU'RE IN",
  
  // Error States
  failed: "NOPE, TRY AGAIN",
  walletRejected: "WALLET FAILURE - REJECTED",
  networkError: "CONNECTION FAILED - SKILL ISSUE?",
  sessionExpired: "SESSION EXPIRED - SIGN IN AGAIN",
  signatureFailed: "SIGNATURE INVALID - TRY HARDER",
  unknownError: "SOMETHING BROKE - NOT OUR FAULT",
  
  // Challenge Messages
  challengeTitle: "PROVE YOU'RE REAL",
  challengeSubtitle: "SIGN THIS FOR DNA SEQUENCING",
  
  // Loading States
  loadingNfts: "SCANNING NFT COLLECTION...",
  
  // Success Messages
  nftsLoaded: "COLLECTION LOADED",
  authComplete: "AUTHENTICATION COMPLETE",
  
  // Disconnect
  disconnect: "LOG OUT",
  disconnected: "SIGNED OUT"
};

export const generateChallenge = (): AuthChallenge => {
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  return {
    message: `${PUNK_MESSAGES.challengeTitle} - ${PUNK_MESSAGES.challengeSubtitle}\n\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`,
    nonce,
    timestamp
  };
};