/**
 * UE5 Contract Mapping Configuration
 * 
 * Maps CloneX ecosystem contracts to UE5 character/item categories
 * for ProjectPhoenix-BEFE compatibility.
 */

import { UE5ContractInfo, UE5ContractCategory, UE5TokenType } from '../types/ue5Types';
import { NFT_COLLECTIONS } from './nftCollections';

// ============================================================================
// Contract Mapping Configuration
// ============================================================================

export const UE5_CONTRACT_MAPPING = {
  characters: [
    {
      address: NFT_COLLECTIONS.CLONEX.contract,
      name: NFT_COLLECTIONS.CLONEX.name,
      type: NFT_COLLECTIONS.CLONEX.tokenType as UE5TokenType,
      tokenIdRange: { start: 1, end: 20000 },
      symbol: NFT_COLLECTIONS.CLONEX.symbol,
      description: "CloneX Characters - Primary avatars for the metaverse",
      gameCategory: "playable_character",
      rarity: "legendary",
      maxSupply: NFT_COLLECTIONS.CLONEX.totalSupply
    },
    {
      address: NFT_COLLECTIONS.ANIMUS.contract,
      name: NFT_COLLECTIONS.ANIMUS.name,
      type: NFT_COLLECTIONS.ANIMUS.tokenType as UE5TokenType,
      tokenIdRange: { start: 1, end: 11111 },
      symbol: NFT_COLLECTIONS.ANIMUS.symbol,
      description: "Animus Characters - Companion avatars",
      gameCategory: "companion_character",
      rarity: "epic",
      maxSupply: NFT_COLLECTIONS.ANIMUS.totalSupply
    }
  ],
  items: [
    {
      address: NFT_COLLECTIONS.CLONEX_VIALS.contract,
      name: NFT_COLLECTIONS.CLONEX_VIALS.name,
      type: NFT_COLLECTIONS.CLONEX_VIALS.tokenType as UE5TokenType,
      tokenIdRange: { start: 1, end: 50000 },
      symbol: NFT_COLLECTIONS.CLONEX_VIALS.symbol,
      description: "CloneX Vials - Enhancement consumables",
      gameCategory: "consumable_item",
      rarity: "common",
      maxSupply: NFT_COLLECTIONS.CLONEX_VIALS.totalSupply
    },
    {
      address: NFT_COLLECTIONS.ANIMUS_EGGS.contract,
      name: NFT_COLLECTIONS.ANIMUS_EGGS.name,
      type: NFT_COLLECTIONS.ANIMUS_EGGS.tokenType as UE5TokenType,
      tokenIdRange: { start: 1, end: 8888 },
      symbol: NFT_COLLECTIONS.ANIMUS_EGGS.symbol,
      description: "Animus Eggs - Special breeding items",
      gameCategory: "breeding_item",
      rarity: "rare",
      maxSupply: NFT_COLLECTIONS.ANIMUS_EGGS.totalSupply
    }
  ]
} as const;

// ============================================================================
// UE5 Compatible Contract Info
// ============================================================================

export const UE5_CONTRACTS_RESPONSE: {
  characters: UE5ContractInfo[];
  items: UE5ContractInfo[];
} = {
  characters: UE5_CONTRACT_MAPPING.characters.map(contract => ({
    address: contract.address,
    type: contract.type,
    name: contract.name,
    tokenIdRange: contract.tokenIdRange
  })),
  items: UE5_CONTRACT_MAPPING.items.map(contract => ({
    address: contract.address,
    type: contract.type,
    name: contract.name,
    tokenIdRange: contract.tokenIdRange
  }))
};

// ============================================================================
// Contract Lookup Maps
// ============================================================================

/**
 * Map contract address to category (characters/items)
 */
export const CONTRACT_TO_CATEGORY: Record<string, UE5ContractCategory> = {
  [NFT_COLLECTIONS.CLONEX.contract.toLowerCase()]: 'characters',
  [NFT_COLLECTIONS.ANIMUS.contract.toLowerCase()]: 'characters',
  [NFT_COLLECTIONS.CLONEX_VIALS.contract.toLowerCase()]: 'items',
  [NFT_COLLECTIONS.ANIMUS_EGGS.contract.toLowerCase()]: 'items'
};

/**
 * Map contract address to contract name
 */
export const CONTRACT_TO_NAME: Record<string, string> = {
  [NFT_COLLECTIONS.CLONEX.contract.toLowerCase()]: NFT_COLLECTIONS.CLONEX.name,
  [NFT_COLLECTIONS.ANIMUS.contract.toLowerCase()]: NFT_COLLECTIONS.ANIMUS.name,
  [NFT_COLLECTIONS.CLONEX_VIALS.contract.toLowerCase()]: NFT_COLLECTIONS.CLONEX_VIALS.name,
  [NFT_COLLECTIONS.ANIMUS_EGGS.contract.toLowerCase()]: NFT_COLLECTIONS.ANIMUS_EGGS.name
};

/**
 * Map contract address to token type
 */
export const CONTRACT_TO_TYPE: Record<string, UE5TokenType> = {
  [NFT_COLLECTIONS.CLONEX.contract.toLowerCase()]: 'ERC721',
  [NFT_COLLECTIONS.ANIMUS.contract.toLowerCase()]: 'ERC721',
  [NFT_COLLECTIONS.CLONEX_VIALS.contract.toLowerCase()]: 'ERC1155',
  [NFT_COLLECTIONS.ANIMUS_EGGS.contract.toLowerCase()]: 'ERC721'
};

/**
 * Map contract address to full contract info
 */
export const CONTRACT_INFO_MAP: Record<string, typeof UE5_CONTRACT_MAPPING.characters[0] | typeof UE5_CONTRACT_MAPPING.items[0]> = {
  [NFT_COLLECTIONS.CLONEX.contract.toLowerCase()]: UE5_CONTRACT_MAPPING.characters[0],
  [NFT_COLLECTIONS.ANIMUS.contract.toLowerCase()]: UE5_CONTRACT_MAPPING.characters[1],
  [NFT_COLLECTIONS.CLONEX_VIALS.contract.toLowerCase()]: UE5_CONTRACT_MAPPING.items[0],
  [NFT_COLLECTIONS.ANIMUS_EGGS.contract.toLowerCase()]: UE5_CONTRACT_MAPPING.items[1]
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get contract category by address
 */
export const getContractCategory = (contractAddress: string): UE5ContractCategory | null => {
  return CONTRACT_TO_CATEGORY[contractAddress.toLowerCase()] || null;
};

/**
 * Get contract name by address
 */
export const getContractName = (contractAddress: string): string | null => {
  return CONTRACT_TO_NAME[contractAddress.toLowerCase()] || null;
};

/**
 * Get contract type by address
 */
export const getContractType = (contractAddress: string): UE5TokenType | null => {
  return CONTRACT_TO_TYPE[contractAddress.toLowerCase()] || null;
};

/**
 * Check if contract is supported
 */
export const isSupportedContract = (contractAddress: string): boolean => {
  return contractAddress.toLowerCase() in CONTRACT_TO_CATEGORY;
};

/**
 * Get all supported contract addresses
 */
export const getSupportedContracts = (): string[] => {
  return Object.keys(CONTRACT_TO_CATEGORY);
};

/**
 * Get all character contracts
 */
export const getCharacterContracts = (): string[] => {
  return Object.entries(CONTRACT_TO_CATEGORY)
    .filter(([_, category]) => category === 'characters')
    .map(([address, _]) => address);
};

/**
 * Get all item contracts
 */
export const getItemContracts = (): string[] => {
  return Object.entries(CONTRACT_TO_CATEGORY)
    .filter(([_, category]) => category === 'items')
    .map(([address, _]) => address);
};

/**
 * Get full contract info by address
 */
export const getContractInfo = (contractAddress: string) => {
  return CONTRACT_INFO_MAP[contractAddress.toLowerCase()] || null;
};

/**
 * Validate token ID range for contract
 */
export const isValidTokenId = (contractAddress: string, tokenId: string | number): boolean => {
  const info = getContractInfo(contractAddress);
  if (!info || !info.tokenIdRange) return true; // Allow if no range specified
  
  const id = typeof tokenId === 'string' ? parseInt(tokenId, 10) : tokenId;
  return id >= info.tokenIdRange.start && id <= info.tokenIdRange.end;
};

// ============================================================================
// Game Integration Constants
// ============================================================================

export const UE5_GAME_CATEGORIES = {
  CHARACTER_TYPES: {
    PLAYABLE_CHARACTER: 'playable_character',
    COMPANION_CHARACTER: 'companion_character',
    NPC_CHARACTER: 'npc_character'
  },
  ITEM_TYPES: {
    CONSUMABLE_ITEM: 'consumable_item',
    BREEDING_ITEM: 'breeding_item',
    EQUIPMENT_ITEM: 'equipment_item',
    COSMETIC_ITEM: 'cosmetic_item'
  },
  RARITY_LEVELS: {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
    MYTHIC: 'mythic'
  }
} as const;

export const UE5_CONTRACT_PRIORITIES = {
  [NFT_COLLECTIONS.CLONEX.contract.toLowerCase()]: 1,      // Highest priority
  [NFT_COLLECTIONS.ANIMUS.contract.toLowerCase()]: 2,
  [NFT_COLLECTIONS.ANIMUS_EGGS.contract.toLowerCase()]: 3,
  [NFT_COLLECTIONS.CLONEX_VIALS.contract.toLowerCase()]: 4  // Lowest priority
};

// ============================================================================
// Access Level Mapping
// ============================================================================

export const UE5_ACCESS_LEVEL_REQUIREMENTS = {
  NONE: {
    characters: [],
    items: []
  },
  COLLECTOR: {
    characters: [NFT_COLLECTIONS.CLONEX.contract],
    items: []
  },
  ACTIVE_RESEARCHER: {
    characters: [NFT_COLLECTIONS.CLONEX.contract, NFT_COLLECTIONS.ANIMUS.contract],
    items: [NFT_COLLECTIONS.CLONEX_VIALS.contract]
  },
  SENIOR_RESEARCHER: {
    characters: [NFT_COLLECTIONS.CLONEX.contract, NFT_COLLECTIONS.ANIMUS.contract],
    items: [NFT_COLLECTIONS.CLONEX_VIALS.contract, NFT_COLLECTIONS.ANIMUS_EGGS.contract]
  },
  ECOSYSTEM_NATIVE: {
    characters: [NFT_COLLECTIONS.CLONEX.contract, NFT_COLLECTIONS.ANIMUS.contract],
    items: [NFT_COLLECTIONS.CLONEX_VIALS.contract, NFT_COLLECTIONS.ANIMUS_EGGS.contract]
  }
} as const;