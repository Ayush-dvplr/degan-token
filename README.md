# DeganToken Smart Contract

This Solidity program is a simple DeganToken contract that demonstrates the basic syntax and functionality of the Solidity programming language. The purpose of this program is to serve as a starting point for those who are new to Solidity and want to get a feel for how it works.

## Description

This program is a basic DeganToken contract written in Solidity, a programming language used for developing smart contracts on the Ethereum blockchain. The contract includes functionalities such as minting , burning , transfering ERC20 token also owner can create giftcards which can redeem by players to get the Token. This program serves as a simple and straightforward introduction to Solidity programming and can be used as a stepping stone for more complex projects in the future.

In this smart contract we also implements the require(), assert() and revert() statements.

We are also going to use react and web3 to connect our blockchain to frontend.

## Usage/Examples

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DeganToken is ERC20 {
    address public owner;
    address public storeAddress;

    mapping(string => uint256) public redemptionCodes;

    // Events
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event StoreAddressSet(address indexed storeAddress);
    event RedemptionCodeGenerated(string code, uint256 amount);
    event Redeemed(address indexed from, address indexed to, uint256 amount, string code);

    constructor() ERC20("DeganToken", "DGN") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit Minted(to, amount); // Emit Minted event
    }

    function setStoreAddress(address _storeAddress) external onlyOwner {
        storeAddress = _storeAddress;
        emit StoreAddressSet(_storeAddress); // Emit StoreAddressSet event
    }

    function generateRedemptionCode(string memory code , uint256 amount) external onlyOwner {
        redemptionCodes[code] = amount;
        emit RedemptionCodeGenerated(code, amount); // Emit RedemptionCodeGenerated event
    }

    function redeem(uint256 amount, string memory code) external {
        require(storeAddress != address(0), "Store address not set");
        require(redemptionCodes[code] >= amount, "Invalid or insufficient redemption code");

        redemptionCodes[code] -= amount;

        _transfer(owner, msg.sender, amount);
        emit Redeemed(owner, msg.sender, amount, code); // Emit Redeemed event
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount); // Emit Burned event
    }
}

```

## Run Locally

Clone the project

```bash
  git clone https://github.com/Ayush-dvplr/degan-token.git
```

Go to the project directory

```bash
  cd degan-token
```

Go to the frontend directory from another terminal

```bash
  cd frontend
```

Install dependencies

```bash
  npm install
```

Start frontend from the terminalin frontend directory

```bash
  npm start
```

## Screenshots

![App Screenshot](https://res.cloudinary.com/dsprifizw/image/upload/v1722454124/degan-token-home.png)

## Lessons Learned

- Integrate Solidity contracts with React using Hardhat and ensure ABI compatibility

- Utilize React hooks like useState and useEffect for efficient state management and handling blockchain interactions

- Gas Efficiency: Understanding gas implications of error handling helps design more efficient contracts.

- Design smart contracts to minimize gas costs and ensure reliable data storage and retrieval

## Author

- Ayush sah[@linkedin](https://www.linkedin.com/in/ayushsah404/)
