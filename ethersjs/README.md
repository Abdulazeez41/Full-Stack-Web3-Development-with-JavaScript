<!-- GETTING STARTED -->

## Getting Started

This project shows you how to read, write and store data's on the blockchain.

### Installation

Install node by using nvm.

- npm
  ```sh
  nvm install node
  ```
- then
  Install ethers library to interact with the blockchain.

```sh
    npm install ethers
```

To create random wallet address, privatekey and mnemonic phrase.

```sh
    node index.js
```

Read an existing data from either a wallet or a smartcontract.

```sh
    node callReadFunction.js
```

Write data to the blockchain using a walet provider.

```sh
    node callWriteFunction.js
```

Query data's from the blockchain.

```sh
    node eventListener.js
```

Sign data's to be stored on the blockchain.

```sh
    node signMessage.js
```

Read blockchain data's onChain.

```sh
    node readChainData.js
```
