export const CHAIN_ID = 388;
export const RPC_URL = process.env.NEXT_PUBLIC_CRONOS_ZKEVM_RPC || 'https://mainnet.zkevm.cronos.org';
export const SMART_ROUTER = '0x4E792B8c9bcB9E200C3713810C4D6eA8C4230E7c' as const;
export const V2_ROUTER = '0x39aD8C3067281e60045DF041846EE01c1Dd3a853' as const;

export const erc20Abi = [
  {type:'function',name:'decimals',stateMutability:'view',inputs:[],outputs:[{type:'uint8'}]},
  {type:'function',name:'symbol',stateMutability:'view',inputs:[],outputs:[{type:'string'}]},
  {type:'function',name:'balanceOf',stateMutability:'view',inputs:[{name:'owner',type:'address'}],outputs:[{type:'uint256'}]},
  {type:'function',name:'allowance',stateMutability:'view',inputs:[{name:'owner',type:'address'},{name:'spender',type:'address'}],outputs:[{type:'uint256'}]},
  {type:'function',name:'approve',stateMutability:'nonpayable',inputs:[{name:'spender',type:'address'},{name:'amount',type:'uint256'}],outputs:[{type:'bool'}]},
] as const;

export const smartRouterAbi = [
  {type:'function',name:'factory',stateMutability:'view',inputs:[],outputs:[{type:'address'}]},
  {type:'function',name:'factoryV2',stateMutability:'view',inputs:[],outputs:[{type:'address'}]},
  {type:'function',name:'exactInput',stateMutability:'payable',inputs:[{name:'params',type:'tuple',components:[{name:'path',type:'bytes'},{name:'recipient',type:'address'},{name:'amountIn',type:'uint256'},{name:'amountOutMinimum',type:'uint256'}]}],outputs:[{type:'uint256'}]},
  {type:'function',name:'multicall',stateMutability:'payable',inputs:[{name:'deadline',type:'uint256'},{name:'data',type:'bytes[]'}],outputs:[{type:'bytes[]'}]},
] as const;

export const v2RouterAbi = [
  {type:'function',name:'factory',stateMutability:'view',inputs:[],outputs:[{type:'address'}]},
  {type:'function',name:'getAmountsOut',stateMutability:'view',inputs:[{name:'amountIn',type:'uint256'},{name:'path',type:'address[]'}],outputs:[{name:'amounts',type:'uint256[]'}]},
  {type:'function',name:'swapExactTokensForTokens',stateMutability:'nonpayable',inputs:[{name:'amountIn',type:'uint256'},{name:'amountOutMin',type:'uint256'},{name:'path',type:'address[]'},{name:'to',type:'address'},{name:'deadline',type:'uint256'}],outputs:[{name:'amounts',type:'uint256[]'}]},
] as const;

export const v2FactoryAbi = [{type:'function',name:'getPair',stateMutability:'view',inputs:[{name:'tokenA',type:'address'},{name:'tokenB',type:'address'}],outputs:[{type:'address'}]}] as const;
export const v3FactoryAbi = [{type:'function',name:'getPool',stateMutability:'view',inputs:[{name:'tokenA',type:'address'},{name:'tokenB',type:'address'},{name:'fee',type:'uint24'}],outputs:[{type:'address'}]}] as const;

// Common Uniswap V3 QuoterV2 signature. H2's deployed quoter MUST be verified against this ABI before enabling V3 quotes.
export const quoterV2Abi = [{type:'function',name:'quoteExactInput',stateMutability:'nonpayable',inputs:[{name:'path',type:'bytes'},{name:'amountIn',type:'uint256'}],outputs:[{name:'amountOut',type:'uint256'},{name:'sqrtPriceX96AfterList',type:'uint160[]'},{name:'initializedTicksCrossedList',type:'uint32[]'},{name:'gasEstimate',type:'uint256'}]}] as const;
