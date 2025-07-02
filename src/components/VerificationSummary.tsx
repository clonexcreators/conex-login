import React from 'react';
import { VerificationResult } from '../types';
import { StickerCard } from './StickerCard';
import { StatusBadge } from './StatusBadge';
import { CollectionBadge } from './CollectionBadge';
import { NFT_MESSAGES } from '../constants/nftMessages';
import { Activity, Database, Shield, CheckCircle, Users, Link } from 'lucide-react';

interface VerificationSummaryProps {
  result: VerificationResult | null;
  isLoading: boolean;
}

export const VerificationSummary: React.FC<VerificationSummaryProps> = ({ 
  result, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <StickerCard variant="research-panel" className="text-center">
        <div className="w-16 h-16 bg-[#00C2FF] border-2 border-[#1C1C1C] rounded-[12px] mx-auto mb-4 flex items-center justify-center">
          <Activity className="w-8 h-8 text-black animate-pulse" strokeWidth={2.5} />
        </div>
        <StatusBadge status="processing" text="SCANNING SPECIMEN DATABASE" size="md" pulse={true} />
        <div className="mt-3 lab-text-sm">
          CHECKING ALCHEMY → MORALIS → ETHERSCAN → DELEGATE.XYZ
        </div>
      </StickerCard>
    );
  }
  
  if (!result) return null;
  
  return (
    <StickerCard variant="research-panel" className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="lab-heading-md">
          LABORATORY ANALYSIS COMPLETE
        </h3>
        <StatusBadge 
          status="verified" 
          text={`${result.verificationTime}MS SCAN TIME`} 
          size="md"
        />
      </div>
      
      {/* Access Level Display */}
      <div className="text-center">
        <div className="lab-surface inline-block px-6 py-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#6EFFC7]" strokeWidth={2.5} />
            <span className="lab-heading-md text-[#FF5AF7]">
              CLEARANCE LEVEL: {result.accessLevel.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
      
      {/* Research Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center lab-surface p-3">
          <Database className="w-6 h-6 text-[#FF5AF7] mx-auto mb-2" strokeWidth={2.5} />
          <div className="lab-text-sm mb-1">
            PRIMARY SPECIMENS
          </div>
          <div className="text-2xl font-black text-[#FF5AF7]">
            {result.directNFTs.length}
          </div>
        </div>
        
        <div className="text-center lab-surface-elevated p-3">
          <Link className="w-6 h-6 text-[#00C2FF] mx-auto mb-2" strokeWidth={2.5} />
          <div className="lab-text-sm mb-1">
            DELEGATED ACCESS
          </div>
          <div className="text-2xl font-black text-[#00C2FF]">
            {result.delegatedNFTs.length}
          </div>
        </div>
        
        <div className="text-center lab-surface p-3">
          <CheckCircle className="w-6 h-6 text-[#6EFFC7] mx-auto mb-2" strokeWidth={2.5} />
          <div className="lab-text-sm mb-1">
            BLOCKCHAIN VERIFIED
          </div>
          <div className="text-2xl font-black text-[#6EFFC7]">
            {result.blockchainVerified}
          </div>
        </div>
        
        <div className="text-center lab-surface-elevated p-3">
          <Activity className="w-6 h-6 text-black mx-auto mb-2" strokeWidth={2.5} />
          <div className="lab-text-sm mb-1">
            TOTAL SPECIMENS
          </div>
          <div className="text-2xl font-black text-black">
            {result.totalNFTs}
          </div>
        </div>
      </div>
      
      {/* Delegation Summary */}
      {result.delegationSummary && result.delegationSummary.totalDelegations > 0 && (
        <div className="lab-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Link className="w-5 h-5 text-[#00C2FF]" strokeWidth={2.5} />
            <h4 className="lab-heading-md">DELEGATION ANALYSIS</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="lab-text-sm mb-1">VAULT WALLETS</div>
              <div className="text-xl font-black text-[#00C2FF]">
                {result.delegationSummary.totalVaults}
              </div>
            </div>
            
            <div>
              <div className="lab-text-sm mb-1">TOTAL DELEGATIONS</div>
              <div className="text-xl font-black text-[#FF5AF7]">
                {result.delegationSummary.totalDelegations}
              </div>
            </div>
            
            <div>
              <div className="lab-text-sm mb-1">DELEGATION TYPES</div>
              <div className="flex flex-wrap gap-1 justify-center">
                {Object.entries(result.delegationSummary.byType).map(([type, count]) => (
                  <StatusBadge
                    key={type}
                    status="active"
                    text={`${type}: ${count}`}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Data Sources */}
      <div>
        <div className="lab-text-sm mb-3">
          VERIFICATION SOURCES
        </div>
        <div className="flex flex-wrap gap-2">
          {result.verificationSources.map(source => (
            <StatusBadge
              key={source}
              status="active"
              text={source}
              size="sm"
            />
          ))}
          {result.delegatedNFTs.length > 0 && (
            <StatusBadge
              status="active"
              text="DELEGATE.XYZ"
              size="sm"
            />
          )}
        </div>
      </div>
      
      {/* Blockchain Analytics */}
      {result.etherscanData && (
        <div className="border-t-2 border-[#1C1C1C] pt-4">
          <div className="lab-text-sm mb-3">
            TRANSACTION HISTORY
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="font-bold">
              TOTAL TXS: <span className="text-[#FF5AF7]">{result.etherscanData.totalTransactions}</span>
            </div>
            {result.etherscanData.recentActivity && (
              <StatusBadge status="verified" text="RECENT ACTIVITY DETECTED" size="sm" />
            )}
          </div>
        </div>
      )}
      
      {/* Collection Analysis */}
      <div className="flex flex-wrap gap-4 justify-center">
        {result.collections.includes('clonex' as any) && (
          <CollectionBadge
            collection="clonex"
            count={result.nftDetails.filter(nft => 
              nft.contractAddress.toLowerCase().includes('49cf6f5d44e70224e2e23fdcdd2c053f30ada28b')
            ).length}
            verified={true}
          />
        )}
        {result.collections.includes('animus' as any) && (
          <CollectionBadge
            collection="animus"
            count={result.nftDetails.filter(nft => 
              nft.contractAddress.toLowerCase().includes('ec99492dd9ef8ca48f691acd67d2c96a0a43935f')
            ).length}
            verified={true}
          />
        )}
      </div>
      
      {/* Access Level Details */}
      <div className="lab-surface p-4 text-center">
        <div className="lab-text-sm mb-2">RESEARCH CLEARANCE GRANTED</div>
        <div className="flex items-center justify-center gap-2">
          <Users className="w-5 h-5 text-[#6EFFC7]" strokeWidth={2.5} />
          <span className="lab-heading-md text-[#6EFFC7]">
            FULL DATABASE ACCESS AUTHORIZED
          </span>
        </div>
      </div>
    </StickerCard>
  );
};