import Moralis from 'moralis';

const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY;

let isInitialized = false;

export const initializeMoralis = async () => {
  if (!isInitialized && MORALIS_API_KEY) {
    try {
      await Moralis.start({
        apiKey: MORALIS_API_KEY,
      });
      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Moralis:', error);
    }
  }
};

export const getNFTsByAddress = async (address: string, contractAddress: string) => {
  try {
    await initializeMoralis();
    
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      chain: '0x1', // Ethereum mainnet
      format: 'decimal',
      tokenAddresses: [contractAddress],
      address,
    });

    return response.raw.result || [];
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
};