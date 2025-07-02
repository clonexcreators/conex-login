export const NFT_COLLECTIONS = {
  CLONEX: {
    name: 'CloneX',
    contract: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b',
    symbol: 'CLONEX',
    totalSupply: 20000,
    opensea: 'https://opensea.io/collection/clonex',
    website: 'https://clonex.wtf',
    tokenType: 'ERC721'
  },
  ANIMUS: {
    name: 'Animus',
    contract: '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f',
    symbol: 'ANIMUS',
    totalSupply: 11111,
    opensea: 'https://opensea.io/collection/animus',
    website: 'https://clonex.wtf',
    tokenType: 'ERC721'
  },
  ANIMUS_EGGS: {
    name: 'Animus Eggs',
    contract: '0x6c410cf0b8c113dc6a7641b431390b11d5515082',
    symbol: 'EGGS',
    totalSupply: 8888,
    opensea: 'https://opensea.io/collection/animus-eggs',
    website: 'https://clonex.wtf',
    tokenType: 'ERC721'
  },
  CLONEX_VIALS: {
    name: 'CloneX Vials',
    contract: '0x348fc118bcc65a92dc033a951af153d14d945312',
    symbol: 'VIALS',
    totalSupply: 50000,
    opensea: 'https://opensea.io/collection/clonex-vials',
    website: 'https://clonex.wtf',
    tokenType: 'ERC1155'
  }
} as const;

export const ACCESS_LEVELS = {
  NONE: {
    level: 'NONE',
    requirements: { clonex: 0, animus: 0, animus_eggs: 0, clonex_vials: 0 },
    features: ['basic_access']
  },
  COLLECTOR: {
    level: 'COLLECTOR',
    requirements: { clonex: 1, animus: 0, animus_eggs: 0, clonex_vials: 0 },
    features: ['basic_access', 'collector_features']
  },
  ACTIVE_RESEARCHER: {
    level: 'ACTIVE_RESEARCHER',
    requirements: { clonex: 2, animus: 1, animus_eggs: 1, clonex_vials: 5 },
    features: ['basic_access', 'collector_features', 'research_features']
  },
  SENIOR_RESEARCHER: {
    level: 'SENIOR_RESEARCHER',
    requirements: { clonex: 5, animus: 2, animus_eggs: 3, clonex_vials: 10 },
    features: ['basic_access', 'collector_features', 'research_features', 'senior_features']
  },
  ECOSYSTEM_NATIVE: {
    level: 'ECOSYSTEM_NATIVE',
    requirements: { clonex: 10, animus: 5, animus_eggs: 5, clonex_vials: 25 },
    features: ['basic_access', 'collector_features', 'research_features', 'senior_features', 'ecosystem_native']
  }
} as const;