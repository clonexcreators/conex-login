import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('WalletConnect Project ID is required');
}

export const config = getDefaultConfig({
  appName: 'CloneX Universal Login',
  projectId,
  chains: [mainnet],
  ssr: false,
});