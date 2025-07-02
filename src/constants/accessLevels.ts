/**
 * Production 6-Tier Access Level System for CloneX Universal Login
 */

export type AccessLevel = 
  | 'COSMIC_CHAMPION' 
  | 'CLONE_VANGUARD' 
  | 'CLONE_DISCIPLE' 
  | 'ANIMUS_PRIME' 
  | 'ANIMUS_HATCHLING' 
  | 'LOST_CODE';

export interface AccessLevelConfig {
  level: AccessLevel;
  title: string;
  description: string;
  requirements: string;
  badge: string;
  color: string;
  subdomains: string[];
  features: string[];
  nftRequirements: {
    clonex: number;
    animus: number;
    animus_eggs?: number;
    clonex_vials?: number;
  };
}

export const ACCESS_LEVEL_CONFIG: Record<AccessLevel, AccessLevelConfig> = {
  'COSMIC_CHAMPION': {
    level: 'COSMIC_CHAMPION',
    title: 'Cosmic Champion',
    description: 'Ultimate ecosystem status',
    requirements: '15+ CloneX, 10+ Animus',
    badge: 'rainbow-holographic',
    color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
    subdomains: ['gm', 'gro', 'profile', 'lore', 'lab', 'research', 'admin'],
    features: ['all_access', 'admin_panel', 'beta_features', 'exclusive_content'],
    nftRequirements: {
      clonex: 15,
      animus: 10
    }
  },
  'CLONE_VANGUARD': {
    level: 'CLONE_VANGUARD',
    title: 'Clone Vanguard',
    description: 'High-ranking CloneX holder',
    requirements: '5+ CloneX, 5+ Animus',
    badge: 'gold',
    color: 'bg-[#FFD700]',
    subdomains: ['gm', 'gro', 'profile', 'lore', 'lab', 'research'],
    features: ['premium_features', 'early_access', 'advanced_tools'],
    nftRequirements: {
      clonex: 5,
      animus: 5
    }
  },
  'CLONE_DISCIPLE': {
    level: 'CLONE_DISCIPLE',
    title: 'Clone Disciple',
    description: 'CloneX collector - enhanced features',
    requirements: '1+ CloneX',
    badge: 'silver',
    color: 'bg-[#C0C0C0]',
    subdomains: ['gm', 'gro', 'profile', 'lore', 'research'],
    features: ['basic_features', 'nft_verification', 'profile_access'],
    nftRequirements: {
      clonex: 1,
      animus: 0
    }
  },
  'ANIMUS_PRIME': {
    level: 'ANIMUS_PRIME',
    title: 'Animus Prime',
    description: 'Animus specialist - unique features',
    requirements: '5+ Animus, 0 CloneX',
    badge: 'purple',
    color: 'bg-[#9932CC]',
    subdomains: ['gm', 'gro', 'profile', 'lore', 'research'],
    features: ['animus_features', 'companion_access', 'breeding_system'],
    nftRequirements: {
      clonex: 0,
      animus: 5
    }
  },
  'ANIMUS_HATCHLING': {
    level: 'ANIMUS_HATCHLING',
    title: 'Animus Hatchling',
    description: 'Entry level - basic features enabled',
    requirements: '1+ Animus (or no CloneX)',
    badge: 'bronze',
    color: 'bg-[#CD7F32]',
    subdomains: ['gm', 'gro', 'profile'],
    features: ['basic_features', 'animus_access'],
    nftRequirements: {
      clonex: 0,
      animus: 1
    }
  },
  'LOST_CODE': {
    level: 'LOST_CODE',
    title: 'Lost Code',
    description: 'No NFTs detected - public access only',
    requirements: 'No qualifying NFTs',
    badge: 'gray',
    color: 'bg-[#808080]',
    subdomains: ['gm'],
    features: ['guest_access', 'marketplace_view'],
    nftRequirements: {
      clonex: 0,
      animus: 0
    }
  }
};

/**
 * Calculate access level based on NFT holdings
 */
export const calculateAccessLevel = (collections: {
  clonex: number;
  animus: number;
  animus_eggs: number;
  clonex_vials: number;
}): AccessLevel => {
  const { clonex, animus, animus_eggs, clonex_vials } = collections;

  if (
    clonex >= 15 &&
    animus >= 10 &&
    animus_eggs >= 0 &&
    clonex_vials >= 0
  ) {
    return 'COSMIC_CHAMPION';
  }

  if (
    clonex >= 5 &&
    animus >= 5 &&
    animus_eggs >= 0 &&
    clonex_vials >= 0
  ) {
    return 'CLONE_VANGUARD';
  }

  if (
    clonex >= 1 &&
    animus >= 0 &&
    animus_eggs >= 0 &&
    clonex_vials >= 0
  ) {
    return 'CLONE_DISCIPLE';
  }

  if (
    clonex === 0 &&
    animus >= 5 &&
    animus_eggs >= 0 &&
    clonex_vials >= 0
  ) {
    return 'ANIMUS_PRIME';
  }

  if (clonex === 0 || animus >= 1) {
    return 'ANIMUS_HATCHLING';
  }

  if (
    clonex === 0 &&
    animus === 0 &&
    animus_eggs >= 0 &&
    clonex_vials >= 0
  ) {
    return 'LOST_CODE';
  }

  return 'LOST_CODE';
};

/**
 * Check if user has access to a specific subdomain
 */
export const hasSubdomainAccess = (
  accessLevel: AccessLevel, 
  targetSubdomain: string
): boolean => {
  const config = ACCESS_LEVEL_CONFIG[accessLevel];
  return config.subdomains.includes(targetSubdomain.toLowerCase());
};

/**
 * Get minimum access level required for a subdomain
 */
export const getMinimumAccessForSubdomain = (subdomain: string): AccessLevel => {
  const subdomainRequirements: Record<string, AccessLevel> = {
    'admin': 'COSMIC_CHAMPION',
    'lab': 'CLONE_VANGUARD',
    'research': 'CLONE_DISCIPLE',
    'gro': 'ANIMUS_HATCHLING',
    'lore': 'ANIMUS_HATCHLING',
    'profile': 'ANIMUS_HATCHLING',
    'gm': 'LOST_CODE'
  };
  
  return subdomainRequirements[subdomain.toLowerCase()] || 'LOST_CODE';
};

/**
 * Get upgrade path for user
 */
export const getUpgradePath = (
  currentLevel: AccessLevel,
  targetLevel: AccessLevel
): {
  possible: boolean;
  requirements: string;
  nftsNeeded: Partial<{
    clonex: number;
    animus: number;
    animus_eggs: number;
    clonex_vials: number;
  }>;
} => {
  const current = ACCESS_LEVEL_CONFIG[currentLevel];
  const target = ACCESS_LEVEL_CONFIG[targetLevel];
  
  const nftsNeeded: any = {};
  let possible = true;
  
  Object.entries(target.nftRequirements).forEach(([collection, required]) => {
    const currentAmount = current.nftRequirements[collection as keyof typeof current.nftRequirements] || 0;
    if (required > currentAmount) {
      nftsNeeded[collection] = required - currentAmount;
    }
  });
  
  const requirements = Object.entries(nftsNeeded)
    .map(([collection, amount]) => `${amount} more ${collection.replace('_', ' ')}`)
    .join(', ');
  
  return {
    possible,
    requirements: requirements || 'Already qualified',
    nftsNeeded
  };
};
