import { encodePacked, type Address, type PublicClient } from 'viem';
import { CHAIN_ID, RPC_URL, SMART_ROUTER, V2_ROUTER, erc20Abi, smartRouterAbi, v2RouterAbi, v2FactoryAbi, v3FactoryAbi, quoterV2Abi } from './contracts';

export type TokenInfo = { address: Address; symbol: string; decimals: number };
export type RouteQuote = { dex: 'V2'|'V3'; path: Address[]; fees?: number[]; amountOut: bigint; encodedPath?: `0x${string}`; label: string };
export const ZERO = '0x0000000000000000000000000000000000000000' as Address;

export async function getTokenInfo(client: PublicClient, address: Address): Promise<TokenInfo> {
  const [decimals, symbol] = await Promise.all([
    client.readContract({address, abi: erc20Abi, functionName:'decimals'}),
    client.readContract({address, abi: erc20Abi, functionName:'symbol'}).catch(() => address.slice(0,6)+'…'),
  ]);
  if (decimals > 36) throw new Error('Unexpected token decimals');
  return {address, symbol, decimals};
}

export async function discoverQuotes(client: PublicClient, tokenIn: Address, tokenOut: Address, amountIn: bigint, intermediates: Address[], fees: number[], v3Quoter?: Address): Promise<RouteQuote[]> {
  if (tokenIn.toLowerCase() === tokenOut.toLowerCase()) throw new Error('Input and output tokens must differ.');
  const quotes: RouteQuote[] = [];
  const routerV2Factory = await client.readContract({address: V2_ROUTER, abi: v2RouterAbi, functionName:'factory'}).catch(() => ZERO);
  const smartV2Factory = await client.readContract({address: SMART_ROUTER, abi: smartRouterAbi, functionName:'factoryV2'}).catch(() => ZERO);
  const factories = [...new Set([routerV2Factory, smartV2Factory].filter(x => x !== ZERO))];
  const candidatePaths: Address[][] = [[tokenIn, tokenOut], ...intermediates.filter(x => x.toLowerCase() !== tokenIn.toLowerCase() && x.toLowerCase() !== tokenOut.toLowerCase()).map(x => [tokenIn,x,tokenOut])];

  for (const path of candidatePaths) {
    let exists = true;
    for (let i=0;i<path.length-1;i++) {
      let found = false;
      for (const factory of factories) {
        try { const pair = await client.readContract({address:factory,abi:v2FactoryAbi,functionName:'getPair',args:[path[i],path[i+1]]}); if (pair !== ZERO) {found=true;break;} } catch {}
      }
      if (!found) {exists=false;break;}
    }
    if (!exists) continue;
    for (const router of [V2_ROUTER, SMART_ROUTER]) {
      try {
        const amounts = await client.readContract({address:router,abi:v2RouterAbi,functionName:'getAmountsOut',args:[amountIn,path]});
        const amountOut = amounts[amounts.length-1];
        if (amountOut > 0n) quotes.push({dex:'V2',path,amountOut,label:`V2 · ${path.length-1} hop${path.length>2?'s':''}`});
      } catch {}
    }
  }

  if (v3Quoter) {
    const v3Factory = await client.readContract({address:SMART_ROUTER,abi:smartRouterAbi,functionName:'factory'});
    const v3Paths: {tokens:Address[];fees:number[]}[] = [];
    for (const fee of fees) v3Paths.push({tokens:[tokenIn,tokenOut],fees:[fee]});
    for (const mid of intermediates.filter(x => x.toLowerCase() !== tokenIn.toLowerCase() && x.toLowerCase() !== tokenOut.toLowerCase())) {
      for (const f1 of fees) for (const f2 of fees) v3Paths.push({tokens:[tokenIn,mid,tokenOut],fees:[f1,f2]});
    }
    for (const candidate of v3Paths) {
      let exists = true;
      for (let i=0;i<candidate.tokens.length-1;i++) {
        try { const pool = await client.readContract({address:v3Factory,abi:v3FactoryAbi,functionName:'getPool',args:[candidate.tokens[i],candidate.tokens[i+1],candidate.fees[i]]}); if (pool===ZERO) {exists=false;break;} } catch {exists=false;break;}
      }
      if (!exists) continue;
      let encodedPath: `0x${string}`;
      if (candidate.fees.length === 1) {
        encodedPath = encodePacked(['address','uint24','address'], [candidate.tokens[0], candidate.fees[0], candidate.tokens[1]]);
      } else {
        encodedPath = encodePacked(['address','uint24','address','uint24','address'], [candidate.tokens[0], candidate.fees[0], candidate.tokens[1], candidate.fees[1], candidate.tokens[2]]);
      }
      try {
        const result = await client.readContract({address:v3Quoter,abi:quoterV2Abi,functionName:'quoteExactInput',args:[encodedPath,amountIn]});
        const amountOut = result[0];
        if (amountOut>0n) quotes.push({dex:'V3',path:candidate.tokens,fees:candidate.fees,amountOut,encodedPath,label:`V3 · ${candidate.tokens.length-1} hop${candidate.tokens.length>2?'s':''} · ${candidate.fees.join('/')}`});
      } catch {}
    }
  }
  return quotes.sort((a,b)=>a.amountOut===b.amountOut?0:a.amountOut>b.amountOut?-1:1);
}
