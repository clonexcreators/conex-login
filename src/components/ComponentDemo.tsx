import React, { useState } from 'react';
import { StickerButton } from './StickerButton';
import { AccessLevelBadge } from './AccessLevelBadge';
import { StickerCard } from './StickerCard';
import { LoadingSpinner } from './LoadingSpinner';
import { AccessLevel } from '../config/api';

export const ComponentDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const testLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const accessLevels: AccessLevel[] = [
    'COSMIC_CHAMPION',
    'CLONE_VANGUARD', 
    'DNA_DISCIPLE',
    'ANIMUS_PRIME',
    'ANIMUS_HATCHLING',
    'LOST_CODE'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <StickerCard variant="research-panel">
          <h1 className="text-4xl font-black uppercase text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
            CloneX UI Components
          </h1>
          <p className="text-center text-gray-600 font-bold">
            Testing all punk-styled components - Consistent badge sizing applied
          </p>
        </StickerCard>

        {/* Buttons */}
        <StickerCard>
          <h2 className="text-2xl font-black uppercase mb-6">Sticker Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StickerButton variant="primary" onClick={testLoading}>
              PRIMARY
            </StickerButton>
            <StickerButton variant="secondary" onClick={testLoading}>
              SECONDARY
            </StickerButton>
            <StickerButton variant="danger" onClick={testLoading}>
              DANGER
            </StickerButton>
            <StickerButton variant="ghost" onClick={testLoading}>
              GHOST
            </StickerButton>
          </div>
          
          <div className="mt-6 space-y-4">
            <StickerButton 
              variant="primary" 
              size="lg" 
              loading={loading}
              onClick={testLoading}
              className="w-full"
            >
              {loading ? 'PROCESSING...' : 'TAP IN'}
            </StickerButton>
          </div>
        </StickerCard>

        {/* Access Level Badges - All same size now */}
        <StickerCard variant="verification-card">
          <h2 className="text-2xl font-black uppercase mb-6">Access Level Badges</h2>
          <p className="text-center text-gray-600 font-bold mb-4">
            All badges now use consistent sizing (120px minimum width)
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {accessLevels.map((level) => (
              <AccessLevelBadge 
                key={level}
                accessLevel={level}
                showDescription
                showRequirements
              />
            ))}
          </div>
        </StickerCard>

        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StickerCard variant="default">
            <h3 className="font-black uppercase mb-2">Default Card</h3>
            <p className="text-sm text-gray-600">Basic white card with shadow</p>
          </StickerCard>
          
          <StickerCard variant="research-panel">
            <h3 className="font-black uppercase mb-2">Research Panel</h3>
            <p className="text-sm text-gray-600">Purple gradient panel</p>
          </StickerCard>
          
          <StickerCard variant="verification-card">
            <h3 className="font-black uppercase mb-2">Verification</h3>
            <p className="text-sm text-gray-600">Teal verification card</p>
          </StickerCard>
          
          <StickerCard variant="error-card">
            <h3 className="font-black uppercase mb-2">Error Card</h3>
            <p className="text-sm text-gray-600">Red error styling</p>
          </StickerCard>
        </div>

        {/* Loading Spinners */}
        <StickerCard>
          <h2 className="text-2xl font-black uppercase mb-6">Loading Spinners</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <LoadingSpinner size="lg" message="DNA SCANNING..." variant="primary" />
            </div>
            <div className="text-center">
              <LoadingSpinner size="lg" message="VERIFYING NFTS..." variant="secondary" />
            </div>
            <div className="bg-gray-800 rounded-2xl p-6">
              <LoadingSpinner size="lg" message="AUTHENTICATING..." variant="white" />
            </div>
          </div>
        </StickerCard>

        {/* Interactive Testing Section */}
        <StickerCard variant="success-card">
          <h2 className="text-2xl font-black uppercase mb-6">Interactive Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-black uppercase mb-4">Button States</h3>
              <div className="space-y-3">
                <StickerButton variant="primary" size="sm" className="w-full">Small Button</StickerButton>
                <StickerButton variant="secondary" size="md" className="w-full">Medium Button</StickerButton>
                <StickerButton variant="danger" size="lg" className="w-full">Large Button</StickerButton>
                <StickerButton variant="ghost" disabled className="w-full">Disabled Button</StickerButton>
              </div>
            </div>
            
            <div>
              <h3 className="font-black uppercase mb-4">Consistent Badge Sizes</h3>
              <div className="space-y-3 flex flex-col items-center">
                <AccessLevelBadge accessLevel="COSMIC_CHAMPION" />
                <AccessLevelBadge accessLevel="CLONE_VANGUARD" />
                <AccessLevelBadge accessLevel="DNA_DISCIPLE" />
                <AccessLevelBadge accessLevel="ANIMUS_PRIME" />
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                All badges: px-4 py-2 text-sm min-w-[120px]
              </p>
            </div>
          </div>
        </StickerCard>

        {/* Component Status */}
        <StickerCard>
          <h2 className="text-2xl font-black uppercase mb-6 text-center">Task 3 Component Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-100 border-2 border-green-500 rounded-xl">
              <div className="font-black text-green-700">✅ STICKER BUTTON</div>
              <div className="text-xs text-green-600">Complete with all variants</div>
            </div>
            <div className="text-center p-4 bg-green-100 border-2 border-green-500 rounded-xl">
              <div className="font-black text-green-700">✅ ACCESS BADGES</div>
              <div className="text-xs text-green-600">✨ Consistent sizing applied</div>
            </div>
            <div className="text-center p-4 bg-green-100 border-2 border-green-500 rounded-xl">
              <div className="font-black text-green-700">✅ STICKER CARDS</div>
              <div className="text-xs text-green-600">5 variants with hover states</div>
            </div>
            <div className="text-center p-4 bg-green-100 border-2 border-green-500 rounded-xl">
              <div className="font-black text-green-700">✅ LOADING SPINNER</div>
              <div className="text-xs text-green-600">3 variants with animations</div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-block p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl border-4 border-white font-black uppercase shadow-lg">
              🎉 All Core UI Components Ready for Task 4! 🎉
            </div>
            <p className="text-sm text-gray-600 mt-2 font-semibold">
              ✨ Badge sizing optimized - All badges now consistent at 120px minimum width
            </p>
          </div>
        </StickerCard>

      </div>
    </div>
  );
};