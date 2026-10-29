# Orbit Swap — Cronos zkEVM

Independent Next.js + TypeScript swap UI starter. It does not use the H2 website. It connects to an injected wallet and interacts with contracts directly.

## Critical status/safety notes

- Cronos zkEVM is winding down. Check the official explorer/announcement and current liquidity before trading.
- Router addresses are configured from prior H2 contract-directory research, but must be re-verified on the target network before use.
- V2 route quoting uses `getAmountsOut` and checks factory pairs. It only searches direct routes and routes through intermediate tokens you manually provide.
- Optional V3 quoting uses the common Uniswap QuoterV2 ABI. **Do not set `NEXT_PUBLIC_H2_V3_QUOTER` unless you have independently verified that the deployed quoter has exactly this ABI and is compatible with the router/factory.** The previous ABI file established SmartRouter methods, not quoter compatibility.
- This starter is not audited and has not been run against live H2 deployments. Treat it as a development scaffold. First test with read-only calls / a fork / a test environment, then small amounts only if the network and liquidity are operational.
- Do not add a seed phrase or private key to this app or Vercel. Wallet signing stays in the injected wallet.

## Run locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Connect MetaMask on Cronos zkEVM (chain ID 388). Enter verified token addresses and amount. Intermediate token addresses are optional and comma-separated. The app queries V2 direct/one-intermediate paths. V3 quotes are attempted only if a compatible quoter address is supplied.

## Vercel deployment

1. Create a GitHub repository and upload this project folder.
2. In Vercel, **Add New → Project**, import the repository.
3. Framework preset: Next.js. Build command: `npm run build`.
4. Add `NEXT_PUBLIC_CRONOS_ZKEVM_RPC` only if you have a reliable RPC endpoint. Otherwise the public default is used (may be rate-limited).
5. Leave `NEXT_PUBLIC_H2_V3_QUOTER` blank until the exact quoter ABI is verified.
6. Deploy a Preview first. Check wallet connection, chain switching, read-only quotes, then simulation behavior. Deploy to Production only after testing.

Vercel's environment variables are build/deployment scoped; redeploy after changing them. Never put wallet secrets in environment variables.

## Architecture

- `app/page.tsx`: UI, injected-wallet connection, approvals, simulation, execution.
- `lib/contracts.ts`: chain and ABIs.
- `lib/routes.ts`: token metadata and V2/V3 quote discovery.

## Important limitations to fix before mainnet use

- Verify V2 router/factory addresses and function compatibility on-chain.
- Verify V3 factory/quoter addresses and exact ABI. H2's SmartRouter ABI alone does not prove the quoter ABI.
- Expand route search to additional hop depths and a maintained, verified token list if desired.
- Add robust token warnings, output token tax/fee handling, gas estimates, transaction replacement handling, and formal tests/audit.
- Use an independent simulation service or local fork; `simulateContract` checks the RPC's current state but cannot guarantee execution will succeed later.
