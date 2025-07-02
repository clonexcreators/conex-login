# CloneX Universal Login - Production Frontend

> Production-ready React frontend for CloneX ecosystem authentication with VPS backend integration.

## 🚀 Production Deployment Features

- **Live NFT Verification** - Real-time verification using Alchemy, Moralis, and Etherscan APIs
- **6-Tier Access System** - From Cosmic Champion to Lost Code based on NFT holdings
- **Cross-Domain Sessions** - Seamless authentication across *.clonex.wtf subdomains
- **VPS Backend Integration** - Production API at api.clonex.wtf
- **Performance Optimized** - Code splitting, lazy loading, and caching strategies

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Wagmi v2** + **RainbowKit** for Web3 integration
- **TanStack Query** for state management
- **Tailwind CSS** with custom CloneX theming
- **Vite** for build optimization

### Backend Integration
- **Production API**: `https://api.clonex.wtf`
- **Authentication**: JWT with wallet signature verification
- **NFT Verification**: Multi-provider (Alchemy → Moralis → Etherscan)
- **Database**: Hostinger MySQL via VPS

## 🎯 Access Level System

| Level | Title | Requirements | Subdomains |
|-------|--------|-------------|------------|
| **COSMIC_CHAMPION** | Cosmic Champion | 25+ CloneX, 10+ Animus | All subdomains + admin |
| **CLONE_VANGUARD** | Clone Vanguard | 15+ CloneX, 5+ Animus | All except admin |
| **DNA_DISCIPLE** | DNA Disciple | 5+ CloneX, 1+ Animus | gm, gro, profile, lore, research |
| **ANIMUS_PRIME** | Animus Prime | 5+ Animus | gm, gro, profile, lore, research |
| **ANIMUS_HATCHLING** | Animus Hatchling | 1+ CloneX OR 1+ Animus | gm, gro, profile |
| **LOST_CODE** | Lost Code | No qualifying NFTs | gm |

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Web3 Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# NFT Provider APIs
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
VITE_MORALIS_API_KEY=your_moralis_api_key
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: GRO Asset Service
VITE_GRO_ENABLED=true
VITE_GRO_BASE_URL=https://gro.clonex.wtf

# Optional: UE5 Integration
VITE_ENABLE_UE5_AUTH=true
VITE_UE5_JWT_SECRET=your_ue5_jwt_secret
```

### Production API Endpoints

The frontend automatically connects to:
- **Development**: `http://localhost:3000`
- **Production**: `https://api.clonex.wtf`

## 🚀 Deployment Process

### 1. Build for Production

```bash
npm install
npm run build
```

### 2. Upload to Hostinger

1. Download the `dist` folder from your development environment
2. Upload contents to your Hostinger shared hosting root directory for `gm.clonex.wtf`
3. Ensure `.htaccess` file is included for React Router support

### 3. Domain Configuration

The app is designed to work on:
- **Main deployment**: `gm.clonex.wtf`
- **Cross-domain**: Works across all `*.clonex.wtf` subdomains
- **Local development**: `localhost:3000`

## 🔐 Authentication Flow

1. **Wallet Connection** - User connects MetaMask/WalletConnect
2. **Challenge Generation** - Frontend requests nonce from VPS backend
3. **Signature Verification** - User signs challenge, backend verifies
4. **NFT Verification** - Backend verifies NFT holdings via APIs
5. **Access Level Assignment** - User granted appropriate access level
6. **Cross-Domain Session** - JWT stored in cookies for subdomain access

## 🎨 Component Architecture

### Production Components
- `ProductionWalletButton` - Main wallet connection interface
- `ProductionAuthChallenge` - Signature verification UI
- `ProductionNFTDashboard` - User dashboard with NFT collections
- `useProductionAuth` - Main authentication hook

### Core Services
- `productionAuthService` - VPS backend integration
- `errorHandler` - Production error management
- `cookieService` - Cross-domain session management

## 📱 Features

### Core Features
✅ **Wallet Authentication** - MetaMask, WalletConnect, Coinbase Wallet  
✅ **NFT Verification** - Live verification with fallback providers  
✅ **Access Level System** - 6-tier system based on NFT holdings  
✅ **Cross-Domain Sessions** - Seamless subdomain navigation  
✅ **Mobile Responsive** - Optimized for all devices  

### Advanced Features
✅ **Error Handling** - Production-grade error management  
✅ **Performance Optimization** - Code splitting and lazy loading  
✅ **Security Headers** - HTTPS, CSP, and security best practices  
✅ **Caching Strategy** - Optimized asset caching  
✅ **UE5 Integration** - ProjectPhoenix-BEFE compatibility  

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing with Production Backend

Update `.env.local` to point to production API:
```env
VITE_API_BASE_URL=https://api.clonex.wtf
```

## 🚨 Production Checklist

- [ ] Environment variables configured
- [ ] VPS backend deployed at api.clonex.wtf
- [ ] Database tables created on Hostinger MySQL
- [ ] NFT provider API keys active
- [ ] SSL certificates installed
- [ ] Cross-domain cookies working
- [ ] All subdomains configured
- [ ] .htaccess file uploaded
- [ ] Mobile responsiveness tested

## 📦 Build Optimization

The production build includes:
- **Tree Shaking** - Unused code elimination
- **Code Splitting** - Optimal chunk loading
- **Asset Optimization** - Minified CSS/JS
- **Service Worker** - Caching strategy (optional)
- **Bundle Analysis** - Optimized chunk sizes

## 🔗 Integration Points

### VPS Backend Integration
- Authentication endpoints at `api.clonex.wtf`
- JWT token management
- NFT verification APIs
- Cross-domain session validation

### Cross-Domain Support
- Session cookies for `*.clonex.wtf`
- Subdomain access validation
- Automatic redirection for unauthorized access

## 📧 Support

For deployment issues or questions:
- Check browser console for detailed error messages
- Verify API endpoints are accessible
- Ensure environment variables are properly configured
- Test wallet connection on supported browsers

---

**Status**: ✅ Production Ready  
**Backend**: VPS at api.clonex.wtf  
**Frontend**: Ready for gm.clonex.wtf deployment