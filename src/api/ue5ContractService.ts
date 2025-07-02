/**
 * UE5 Contract Information Service for ProjectPhoenix-BEFE Integration
 * 
 * Provides contract metadata and configuration for UE5 character/item verification.
 */

import { 
  UE5ContractsResponse, 
  UE5ContractInfo, 
  UE5APIResponse 
} from '../types/ue5Types';

import { 
  UE5_CONTRACTS_RESPONSE,
  CONTRACT_TO_CATEGORY,
  CONTRACT_TO_NAME,
  CONTRACT_TO_TYPE,
  getContractCategory,
  getContractName,
  getContractType,
  isSupportedContract,
  getSupportedContracts,
  getCharacterContracts,
  getItemContracts
} from '../constants/ue5Contracts';

import { ENV_CONFIG } from '../config/environment';

export interface UE5ContractValidationRequest {
  contractAddress: string;
}

export interface UE5ContractMetadataRequest {
  contractAddress: string;
  includeTokenRange?: boolean;
}

class UE5ContractService {
  
  constructor() {
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🎮 UE5 Contract Service initialized');
      console.log('📋 Supported contracts loaded:', this.getSupportedContractCount());
    }
  }

  // ============================================================================
  // Core Contract Information Methods
  // ============================================================================

  /**
   * Get all supported contracts for UE5
   */
  async getSupportedContracts(): Promise<UE5ContractsResponse> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('📋 Retrieving UE5 supported contracts');
      }

      // Return pre-configured contract mappings
      const contracts = UE5_CONTRACTS_RESPONSE;

      if (ENV_CONFIG.showUE5Debug) {
        console.log(`✅ Contracts retrieved: ${contracts.characters.length} character types, ${contracts.items.length} item types`);
      }

      return contracts;

    } catch (error) {
      console.error('Failed to get supported contracts:', error);
      
      // Return empty structure on error
      return {
        characters: [],
        items: []
      };
    }
  }

  /**
   * Validate if contract is supported by UE5
   */
  async validateContract(request: UE5ContractValidationRequest): Promise<UE5APIResponse<boolean>> {
    try {
      const isSupported = isSupportedContract(request.contractAddress);
      
      if (ENV_CONFIG.showUE5Debug) {
        console.log(`🔍 Contract validation for ${request.contractAddress}: ${isSupported ? 'SUPPORTED' : 'NOT SUPPORTED'}`);
      }

      return {
        success: true,
        data: isSupported,
        message: isSupported ? 'Contract is supported' : 'Contract is not supported by UE5',
        timestamp: Date.now()
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Contract validation failed: ${error.message}`,
        data: false,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get metadata for specific contract
   */
  async getContractMetadata(request: UE5ContractMetadataRequest): Promise<UE5APIResponse<UE5ContractInfo | null>> {
    try {
      if (!isSupportedContract(request.contractAddress)) {
        return {
          success: true,
          data: null,
          message: 'Contract not supported by UE5',
          timestamp: Date.now()
        };
      }

      const contractName = getContractName(request.contractAddress);
      const contractType = getContractType(request.contractAddress);
      const category = getContractCategory(request.contractAddress);

      if (!contractName || !contractType) {
        return {
          success: false,
          error: 'Failed to get contract metadata',
          data: null,
          timestamp: Date.now()
        };
      }

      const metadata: UE5ContractInfo = {
        address: request.contractAddress.toLowerCase(),
        type: contractType,
        name: contractName
      };

      // Add token range if requested and available
      if (request.includeTokenRange) {
        const contractInfo = this.getContractWithTokenRange(request.contractAddress);
        if (contractInfo?.tokenIdRange) {
          metadata.tokenIdRange = contractInfo.tokenIdRange;
        }
      }

      if (ENV_CONFIG.showUE5Debug) {
        console.log(`📋 Contract metadata retrieved for ${contractName} (${category})`);
      }

      return {
        success: true,
        data: metadata,
        timestamp: Date.now()
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get contract metadata: ${error.message}`,
        data: null,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get contracts by category (characters or items)
   */
  async getContractsByCategory(category: 'characters' | 'items'): Promise<UE5APIResponse<UE5ContractInfo[]>> {
    try {
      const allContracts = await this.getSupportedContracts();
      const contractsByCategory = allContracts[category];

      if (ENV_CONFIG.showUE5Debug) {
        console.log(`📋 Retrieved ${contractsByCategory.length} ${category} contracts`);
      }

      return {
        success: true,
        data: contractsByCategory,
        timestamp: Date.now()
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get ${category} contracts: ${error.message}`,
        data: [],
        timestamp: Date.now()
      };
    }
  }

  // ============================================================================
  // Contract Validation Utilities
  // ============================================================================

  /**
   * Check if token ID is valid for contract
   */
  isValidTokenId(contractAddress: string, tokenId: string | number): boolean {
    try {
      const contractInfo = this.getContractWithTokenRange(contractAddress);
      
      if (!contractInfo || !contractInfo.tokenIdRange) {
        // If no range specified, assume all token IDs are valid
        return true;
      }

      const id = typeof tokenId === 'string' ? parseInt(tokenId, 10) : tokenId;
      
      // Check if token ID is within valid range
      return id >= contractInfo.tokenIdRange.start && id <= contractInfo.tokenIdRange.end;

    } catch (error) {
      console.warn(`Token ID validation failed for ${contractAddress}:${tokenId}:`, error);
      return false;
    }
  }

  /**
   * Get character contracts only
   */
  getCharacterContracts(): string[] {
    return getCharacterContracts();
  }

  /**
   * Get item contracts only
   */
  getItemContracts(): string[] {
    return getItemContracts();
  }

  /**
   * Get all supported contract addresses
   */
  getAllSupportedContracts(): string[] {
    return getSupportedContracts();
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Get contract info with token range data
   */
  private getContractWithTokenRange(contractAddress: string): any {
    // This would contain the full contract mapping with token ranges
    // For now, return basic info - expand as needed
    const address = contractAddress.toLowerCase();
    
    const contractMappings: Record<string, any> = {
      '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b': {
        name: 'CloneX',
        tokenIdRange: { start: 1, end: 20000 }
      },
      '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f': {
        name: 'Animus',
        tokenIdRange: { start: 1, end: 11111 }
      },
      '0x348fc118bcc65a92dc033a951af153d14d945312': {
        name: 'CloneX Vials',
        tokenIdRange: { start: 0, end: 999 }
      },
      '0x6c410cf0b8c113dc6a7641b431390b11d5515082': {
        name: 'Animus Eggs',
        tokenIdRange: { start: 1, end: 8888 }
      }
    };

    return contractMappings[address] || null;
  }

  /**
   * Get count of supported contracts
   */
  private getSupportedContractCount(): { characters: number; items: number; total: number } {
    const characterContracts = getCharacterContracts();
    const itemContracts = getItemContracts();
    
    return {
      characters: characterContracts.length,
      items: itemContracts.length,
      total: characterContracts.length + itemContracts.length
    };
  }

  // ============================================================================
  // Debug and Utilities
  // ============================================================================

  /**
   * Get debug information
   */
  getDebugInfo(): {
    serviceName: string;
    supportedContracts: {
      characters: string[];
      items: string[];
      total: number;
    };
    contractMappings: Record<string, string>;
  } {
    const characterContracts = getCharacterContracts();
    const itemContracts = getItemContracts();
    
    const contractMappings: Record<string, string> = {};
    [...characterContracts, ...itemContracts].forEach(address => {
      const name = getContractName(address);
      if (name) {
        contractMappings[address] = name;
      }
    });

    return {
      serviceName: 'UE5ContractService',
      supportedContracts: {
        characters: characterContracts,
        items: itemContracts,
        total: characterContracts.length + itemContracts.length
      },
      contractMappings
    };
  }

  /**
   * Validate all configured contracts
   */
  validateAllContracts(): {
    valid: string[];
    invalid: string[];
    totalValidated: number;
  } {
    const allContracts = getSupportedContracts();
    const valid: string[] = [];
    const invalid: string[] = [];

    allContracts.forEach(address => {
      if (isSupportedContract(address)) {
        valid.push(address);
      } else {
        invalid.push(address);
      }
    });

    if (ENV_CONFIG.showUE5Debug) {
      console.log(`📋 Contract validation: ${valid.length} valid, ${invalid.length} invalid`);
    }

    return {
      valid,
      invalid,
      totalValidated: allContracts.length
    };
  }
}

// Export singleton instance
export const ue5ContractService = new UE5ContractService();