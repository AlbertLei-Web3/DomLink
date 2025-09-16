# domainLine

[Open the App (https://domainline.vercel.app)](https://domainline.vercel.app)

## Project Description

domainLine is a platform designed to facilitate domain trading by enabling users to negotiate directly with each other. The goal of the project is to ensure that all users who want to buy a domain can negotiate, send offers, and accept offers seamlessly within the application.

## Features

- User-to-user negotiation for domain purchases
- Send and accept offers for domains
- Real-time communication and offer management
- Secure and decentralized communication powered by XMTP messaging

## Tech Stack

- **XMTP Messaging**
- **doma orderbook-sdk** (with custom implementation, as the official doma/orderbook-sdk is broken)
- **React**
- **wagmi**

## Getting Started (Windows) / 快速开始（Windows）

1) Node & Install / 安装依赖
- English: Use Node 20+. Prefer npm with legacy peer deps.
- 中文：建议使用 Node 20+。用 npm 并开启 legacy peer deps。
```
npm install --legacy-peer-deps
```

2) Environment / 环境变量（创建 `.env.local`）
```
VITE_DOMA_API_KEY=YOUR_DOMA_API_KEY
VITE_REWOWN_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
```
- English: Get DOMA API key (enable ORDERBOOK, SUBGRAPH; IP whitelist optional). Get Project ID from WalletConnect Cloud.
- 中文：DOMA API Key（勾选 ORDERBOOK、SUBGRAPH；可选 IP 白名单），WalletConnect Cloud 获取 Project ID。

3) Run / 运行
```
npm run dev -- --host 127.0.0.1 --port 5174
```
- English: Visit http://127.0.0.1:5174
- 中文：浏览器访问 http://127.0.0.1:5174

## How it works / 功能与流程

- Chat (XMTP)
  - English: On first use, the wallet signs to create/load XMTP identity (dev env). Start a DM from the search dialog.
  - 中文：首次进入聊天需签名创建/加载 XMTP 身份（dev 环境）。在搜索对话框里对用户发起私信。

- Send Offer / 发送出价
  - English: Select a domain (the app uses that domain’s chain dynamically), choose currency (WETH recommended), enter amount, and submit. If ETH is enough, the app auto-wraps to WETH when needed.
  - 中文：选择域名（按域名所在链动态出价），选择币种（推荐 WETH），填写金额提交。若 ETH 充足，会自动包裹为 WETH。

- Accept Offer / 接受出价
  - English: The acceptor connects wallet and accepts in chat. Current focus is Doma Testnet (chain 97476). If chain mismatches, the UI asks to manually switch.
  - 中文：接收方在聊天中点击接受。目前聚焦 Doma Testnet（链 97476）。若链不一致，UI 会提示手动切换。

## Configuration notes / 配置说明

- Dynamic chain (Send) / 动态链（发送）
  - English: The app derives chainId from the selected domain to avoid hardcoding a single testnet.
  - 中文：从所选域名解析链 ID，避免固定某一测试网。

- Currencies / 币种
  - English: Defaults include WETH/USDC on testnet. If you use another chain, ensure token addresses match that chain.
  - 中文：默认包含测试网的 WETH/USDC。切换到其它链时，请确保代币地址对应该链。

## Troubleshooting / 常见问题

- Can’t open localhost / 无法打开本地站点
  - English: Bind IPv4 and a fixed port: `npm run dev -- --host 127.0.0.1 --port 5174` (VPN TUN may affect localhost).
  - 中文：使用 IPv4 与固定端口（某些 VPN TUN/代理会影响 localhost）。

- XMTP shows empty chats / 聊天为空
  - English: You have no conversations yet. Start a DM from the search dialog; ensure both parties are registered (first-time signature).
  - 中文：还没有会话。请从搜索对话框发起私信；确保双方完成首次 XMTP 签名。

- Fee 400 “contract not found” / 手续费 400 “未找到合约”
  - English: The contract isn’t onboarded on that chain. Use a supported domain/contract for that network (e.g., Doma Testnet 97476).
  - 中文：该合约未在目标链被纳入后端。请使用该网络受支持的域名/合约（如 Doma Testnet 97476）。

- Insufficient funds / 余额不足
  - English: For USDC, ensure sufficient balance and approvals. For WETH, ensure enough ETH (auto-wrap supported) and gas.
  - 中文：USDC 需足额余额与授权；WETH 需足够 ETH（支持自动包裹）与 gas。

- Coinbase metrics 401 / Coinbase 埋点 401
  - English/中文：Analytics only; safe to ignore / 仅分析上报，可忽略。

## Development guide / 开发说明

- English: Key modules are outlined in REVERSE.md (architecture, hooks, handlers).
- 中文：关键模块见 REVERSE.md（架构、hooks 与处理器）。