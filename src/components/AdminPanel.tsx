import React from 'react';
import { StickerCard } from './StickerCard';
import { StatusBadge } from './StatusBadge';
import { Shield, Lock, Settings } from 'lucide-react';

interface AdminPanelProps {
  className?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ className = '' }) => {
  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <StickerCard variant="research-panel" className="bg-[#FF2D75] text-white relative overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border-4 border-black rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#FF2D75]" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-wide">
                ADMIN ZONE
              </h1>
              <p className="text-xl font-bold uppercase tracking-wide opacity-90">
                RESTRICTED ACCESS AREA
              </p>
            </div>
          </div>
          
          <StatusBadge 
            status="loading" 
            text="COMING SOON" 
            size="md" 
          />
        </div>

        {/* Access Restricted Message */}
        <div className="bg-white border-4 border-black rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Lock className="w-8 h-8 text-[#FF2D75]" strokeWidth={3} />
            <h2 className="text-2xl font-black text-black uppercase tracking-wide">
              ACCESS RESTRICTED
            </h2>
          </div>
          
          <p className="text-lg font-bold text-black leading-relaxed mb-6">
            This area is reserved for COSMIC CHAMPIONS and system administrators. 
            Advanced controls for managing the CloneX ecosystem will be available here.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#34EEDC] border-4 border-black rounded-2xl p-4 text-center">
              <Settings className="w-6 h-6 text-black mx-auto mb-2" strokeWidth={3} />
              <h3 className="font-black text-black uppercase text-sm">
                SYSTEM CONTROLS
              </h3>
            </div>
            
            <div className="bg-[#34EEDC] border-4 border-black rounded-2xl p-4 text-center">
              <Shield className="w-6 h-6 text-black mx-auto mb-2" strokeWidth={3} />
              <h3 className="font-black text-black uppercase text-sm">
                USER MANAGEMENT
              </h3>
            </div>
            
            <div className="bg-[#34EEDC] border-4 border-black rounded-2xl p-4 text-center">
              <Lock className="w-6 h-6 text-black mx-auto mb-2" strokeWidth={3} />
              <h3 className="font-black text-black uppercase text-sm">
                ACCESS CONTROL
              </h3>
            </div>
          </div>
        </div>

        {/* Future Functionality Preview */}
        <div className="bg-black border-4 border-white rounded-2xl p-6">
          <h3 className="text-xl font-black text-[#34EEDC] uppercase tracking-wide mb-4">
            PLANNED FEATURES
          </h3>
          
          <ul className="space-y-2 text-white font-bold">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#34EEDC] rounded-full"></span>
              Cross-domain session management
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#34EEDC] rounded-full"></span>
              NFT verification monitoring
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#34EEDC] rounded-full"></span>
              Access level configuration
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#34EEDC] rounded-full"></span>
              System health dashboard
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#34EEDC] rounded-full"></span>
              Analytics and reporting
            </li>
          </ul>
        </div>

        {/* Decorative Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="w-full h-full bg-white transform rotate-45 translate-x-16 -translate-y-16"></div>
        </div>
      </StickerCard>
    </div>
  );
};

export default AdminPanel;