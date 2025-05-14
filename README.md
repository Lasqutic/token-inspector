# my-token-info

A small TypeScript utility to fetch ERC-20 token details (symbol, name, decimals) via direct calls or via a Multicall3 contract.


## Features

* Fetch token symbol, name, and decimals via single JSON-RPC calls.
* Batch multiple calls using the Multicall3 contract to save on RPC round-trips.

## Project Structure

```
my-token-info/
├─ src/
│  ├─ abis/
│  │  ├─ erc20.ts          # ERC-20 ABI definitions
│  │  └─ multicall3.ts     # Multicall3 ABI definition
│  └─ index.ts             # Main entry point
├─ package.json            # NPM scripts & dependencies
├─ tsconfig.json           # TypeScript configuration
└─ .env                    # Contains environment variables (RPC_URL, MULTICALL_ADDRESS, TOKEN_ADDRESS)
```

## Expected Output

When querying the USDT token (address `0xdac17f958d2ee523a2206206994597c13d831ec7`), you should see the following output in your console:

```plaintext
Direct calls:
{
  tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6
}

Multicall:
{
  tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6
}
```

## Configuration

Create a `.env` file in the project root with the following variables:

```dotenv
RPC_URL="https://your-rpc-endpoint"
MULTICALL_ADDRESS="0xYourMulticall3ContractAddress"
TOKEN_ADDRESS="0xTargetTokenAddress"
```

* `RPC_URL`: Your JSON-RPC endpoint (e.g., Infura, Alchemy).
* `MULTICALL_ADDRESS`: Deployed Multicall3 contract address on the target network.
* `TOKEN_ADDRESS`: ERC-20 token address you want to query.


### Direct Fetch

Calls the token contract one method at a time:

```ts
async function fetchDirect(tokenAddress: string): Promise<TokenData>
```

**Returns**: `Promise<TokenData>` with fields:

* `tokenAddress`: string
* `symbol`: string
* `name`: string
* `decimals`: number

### Multicall Fetch

Batches all three calls into a single Multicall3 aggregate:

```ts
async function fetchMulticall(tokenAddress: string): Promise<TokenData>
```

Works similarly but reduces RPC calls by aggregating.


## Environment Variables

Ensure these are set in `.env`:

* `RPC_URL`
* `MULTICALL_ADDRESS`
* `TOKEN_ADDRESS`

