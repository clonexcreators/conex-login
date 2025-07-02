# CloneX Universal Login

CloneX Universal Login is a secure, NFT-gated authentication system for the RTFKT ecosystem.
It verifies ownership of CloneX, Animus, and related NFTs, then assigns tiered access levels based on your wallet's contents.

Users gain access to different subdomains and features depending on their access level.

---

## ⚙️ Tech Stack

* React + Vite
* Node.js (prebuild scripts)
* Web3 wallet login
* NFT collection checker
* Delegate.xyz support
* JWT cross-domain authentication
* TailwindCSS + ShadCN UI

---

## 🔐 Authentication Flow

1. Connect Wallet (MetaMask, WalletConnect, etc.)
2. Sign message (or verify via Delegate.xyz)
3. Fetch NFTs from RTFKT contracts
4. Determine access level
5. Issue secure JWT
6. Redirect to eligible subdomain (e.g. `gro.clonex.wtf`, `lore.clonex.wtf`, `lab.clonex.wtf`)

---

## 🎯 Access Level System

CloneX Universal Login assigns access based on your NFT holdings. The system supports **six dynamic tiers**:

| Level                 | Title            | Requirements           | Subdomain Access             |
| --------------------- | ---------------- | ---------------------- | ---------------------------- |
| **COSMIC\_CHAMPION**  | Cosmic Champion  | 15+ CloneX, 10+ Animus | All subdomains + lab         |
| **CLONE\_VANGUARD**   | Clone Vanguard   | 5+ CloneX, 5+ Animus   | All except admin             |
| **CLONE\_DISCIPLE**   | Clone Disciple   | 1+ CloneX              | profile, lore, gro, research |
| **ANIMUS\_PRIME**     | Animus Prime     | 5+ Animus (0 CloneX)   | profile, lore, gro, research |
| **ANIMUS\_HATCHLING** | Animus Hatchling | 1+ Animus OR 1+ CloneX | gm, gro, profile             |
| **LOST\_CODE**        | Lost Code        | No qualifying NFTs     | gm only                      |

### Access Evaluation Logic

```ts
if (clonex >= 15 && animus >= 10) return 'COSMIC_CHAMPION';
if (clonex >= 5 && animus >= 5) return 'CLONE_VANGUARD';
if (clonex >= 1) return 'CLONE_DISCIPLE';
if (clonex === 0 && animus >= 5) return 'ANIMUS_PRIME';
if (clonex >= 1 || animus >= 1) return 'ANIMUS_HATCHLING';
return 'LOST_CODE';
```

> 💡 **Access is recalculated each session** based on live NFT data. The dashboard reflects your verified status, cached state, and verification method used (e.g. Wallet Signature or Delegate.xyz).

---

## 📁 Project Structure

```
├── public
├── src
│   ├── components       // UI elements (StickerCard, StatusBadge)
│   ├── constants        // Access level config
│   ├── hooks            // useAuth, useProductionAuth
│   ├── shims            // Compatibility patches
│   ├── pages            // Route-level pages
│   ├── utils            // NFT fetching, delegation
│   ├── App.tsx          // Main layout
│   └── main.tsx         // Entry point
├── scripts              // Shim validator & patcher
├── index.html
└── vite.config.ts
```

---

## 🚀 Deployment

1. Run local dev server:

```bash
npm install
npm run dev
```

2. Build for production:

```bash
npm run build
```

3. Upload `/dist` to your subdomain root (e.g., `/public_html/gm`) on Hostinger or your preferred hosting provider.

4. Use `.htaccess` to enforce HTTPS, routing, and CORS if needed.

---

## 🧪 Prebuild Shim Validator

The `scripts/prebuild-shim-validator.js` scans known ESM-breaking dependencies and auto-generates compatibility shims in `/src/shims`.

It also patches `node_modules` for broken ESM export fields, enabling seamless Vite builds in strict environments like StackBlitz or serverless hosting.

---

## 👽 NFT Sources

* [CloneX](https://etherscan.io/address/0x49ac...)
* [Animus](https://etherscan.io/address/0xabc...)
* [Animus Eggs](...)
* [CloneX Vials](...)

All data is pulled directly from on-chain contracts and/or indexed sources.

---

## 🛠 Roadmap

* ✅ Wallet Connect
* ✅ Delegate.xyz Support
* ✅ Cross-Domain JWT Auth
* ✅ Access Levels & Routing
* ✅ NFT Collection Viewer
* ⏳ Admin Panel Controls
* ⏳ User Upgrade Paths
* ⏳ Invite-based Onboarding
* ⏳ Team Wallet Roles

---

## 📎 License

MIT © RTFKT Research Lab

> Built with ❤️ by Curated Pixels for the CloneX ecosystem.
