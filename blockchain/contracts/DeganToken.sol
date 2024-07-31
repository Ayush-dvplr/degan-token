// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DeganToken is ERC20 {
    address public owner;
    address public storeAddress;
    
    mapping(string => uint256) private redemptionCodes;

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

    function generateRedemptionCode(string memory code , uint256 amount) external onlyOwner returns (string memory) {
        redemptionCodes[code] = amount;
        _mint(owner, amount); // Mint new tokens
        emit RedemptionCodeGenerated(code, amount); // Emit RedemptionCodeGenerated event
        return code;
    }

    function redeem(uint256 amount, string memory code) external {
        require(storeAddress != address(0), "Store address not set");
        require(redemptionCodes[code] >= amount, "Invalid or insufficient redemption code");

        redemptionCodes[code] -= amount;
        if (redemptionCodes[code] == 0) {
            delete redemptionCodes[code];
        }
        
        _transfer(storeAddress, msg.sender, amount);
        emit Redeemed(storeAddress, msg.sender, amount, code); // Emit Redeemed event
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount); // Emit Burned event
    }
}
