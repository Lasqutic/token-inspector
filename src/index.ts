import { JsonRpcProvider, Contract, Interface } from "ethers";
import { ERC20_ABI } from "./abis/shortErc20Abi";
import { MULTICALL_ABI  } from "./abis/multicallAbi";
import 'dotenv/config';

type TokenData = {
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
};

const rpcUrl = process.env.RPC_URL;

if (!rpcUrl) {
  throw new Error("RPC_URL is not set in .env");
}

const provider = new JsonRpcProvider(rpcUrl);
const erc20Interface = new Interface(ERC20_ABI);
const multicall3Interface = new Interface(MULTICALL_ABI );

async function fetchDirect(tokenAddress: string): Promise<TokenData> {
  const token = new Contract(tokenAddress, ERC20_ABI, provider);

  const [symbol, name, rawDecimals] = await Promise.all([
    token.symbol(),
    token.name(),
    token.decimals(),
  ]);

  return { tokenAddress, symbol, name, decimals: Number(rawDecimals) };
}

async function fetchMulticall(tokenAddress: string): Promise<TokenData> {

  const calls = [
    {
      target: tokenAddress,
      allowFailure: false,
      callData: erc20Interface.encodeFunctionData("symbol", []),
    },
    {
      target: tokenAddress,
      allowFailure: false,
      callData: erc20Interface.encodeFunctionData("name", []),
    },
    {
      target: tokenAddress,
      allowFailure: false,
      callData: erc20Interface.encodeFunctionData("decimals", []),
    },
  ];

  if (!process.env.MULTICALL_ADDRESS)
    throw new Error("MULTICALL_ADDRESS is not set in .env");

  const multicall = new Contract(
    process.env.MULTICALL_ADDRESS,
    multicall3Interface,
    provider
  );

  const results = await multicall.aggregate3(calls);

  const [symbol] = erc20Interface.decodeFunctionResult(
    "symbol",
    results[0].returnData
  );
  const [name] = erc20Interface.decodeFunctionResult(
    "name",
    results[1].returnData
  );
  const [rawDecimals] = erc20Interface.decodeFunctionResult(
    "decimals",
    results[2].returnData
  );

  return {
    tokenAddress,
    symbol,
    name,
    decimals: Number(rawDecimals),
  };
}

async function main() {
  const USDT = process.env.TOKEN_ADDRESS;
  if (!USDT) {
    throw new Error("TOKEN_ADDRESS is not set in .env");
  }
  console.log("Direct calls:");
  console.log(await fetchDirect(USDT));

  console.log("\n Multicall:");
  console.log(await fetchMulticall(USDT));
}
main();
