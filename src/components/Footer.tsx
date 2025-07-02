import React from 'react';
import { ExternalLink, Github, Twitter, Activity } from 'lucide-react';
import { StickerCard } from './StickerCard';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full px-6 py-16 border-t-2 border-[#1C1C1C] geometric-lab">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <StickerCard variant="research-panel" className="bg-[#FF5AF7] transform -rotate-1">
              <h3 className="lab-heading-lg text-black mb-4">
                CLONEX ENTRY NODE
              </h3>
              <p className="lab-text text-black font-bold leading-relaxed">
                SECURE, DECENTRALIZED AUTHENTICATION FOR THE CLONEX COMMUNITY.
                CONNECT TO DECODE YOUR IDENTITY AND ACCESS ENCRYPTED DATA.
              </p>
            </StickerCard>
          </div>
          
          <div className="space-y-4">
            <h4 className="lab-heading-md">RESEARCH LINKS</h4>
            <div className="space-y-3">
              <a
                href="https://clonex.wtf"
                target="_blank"
                rel="noopener noreferrer"
                className="lab-button-primary px-4 py-2 flex items-center gap-3 no-underline hover:scale-105 transition-transform duration-150"
              >
                FIND OUT WTF <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
              </a>
              <a
                href="https://opensea.io/collection/clonex"
                target="_blank"
                rel="noopener noreferrer"
                className="lab-button-secondary px-4 py-2 flex items-center gap-3 no-underline hover:scale-105 transition-transform duration-150"
              >
                OPENSEA COLLECTION <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="lab-heading-md">COMMUNITY</h4>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/clonexcreators"
                target="_blank"
                rel="noopener noreferrer"
                className="lab-surface p-3 hover:scale-105 transition-transform duration-150"
                title="Follow CloneX Creators on Twitter"
              >
                <Twitter className="w-5 h-5 text-[#FF5AF7]" strokeWidth={2.5} />
              </a>
              <a
                href="https://github.com/clonexcreators"
                target="_blank"
                rel="noopener noreferrer"
                className="lab-surface-elevated p-3 hover:scale-105 transition-transform duration-150"
                title="CloneX Creators on GitHub"
              >
                <Github className="w-5 h-5 text-[#1C1C1C]" strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t-2 border-[#1C1C1C] mt-16 pt-8 text-center">
          <div className="lab-surface inline-block px-8 py-6 transform rotate-1 max-w-2xl">
            <p className="lab-text font-bold text-[#1C1C1C] mb-2">
              © 2025 CLONEX SYSTEMS
            </p>
            <p className="lab-text-sm font-bold text-[#4A4A4A] leading-relaxed">
              Built by the network. Powered by the community.<br />
              <span className="text-[#FF5AF7]">You are the experiment. Welcome to the new evolution.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};