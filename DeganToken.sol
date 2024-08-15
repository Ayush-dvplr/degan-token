// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DeganToken is ERC20 {
    address public owner;
    address public storeAddress;

    struct RedemptionCode {
        uint256 amount;
        uint256 price;
    }

    mapping(string => RedemptionCode) public redemptionCodes;
    string[] public allRedemptionCodes;

    // Events
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event StoreAddressSet(address indexed storeAddress);
    event RedemptionCodeGenerated(string code, uint256 amount, uint256 price);
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
        emit Minted(to, amount);
    }

    function setStoreAddress(address _storeAddress) external onlyOwner {
        storeAddress = _storeAddress;
        emit StoreAddressSet(_storeAddress);
    }

    function generateRedemptionCode(string memory code, uint256 amount, uint256 price) external onlyOwner {
        redemptionCodes[code] = RedemptionCode(amount, price);
        allRedemptionCodes.push(code);
        emit RedemptionCodeGenerated(code, amount, price);
    }

    function redeem(uint256 amount, string memory code) external  {
        require(storeAddress != address(0), "Store address not set");
        require(redemptionCodes[code].amount >= amount, "Invalid or insufficient redemption code");
        require(balanceOf(msg.sender) >= redemptionCodes[code].price, "Insufficient payment");

        _transfer( msg.sender,owner, redemptionCodes[code].price);

        redemptionCodes[code].amount -= amount;

        _transfer(owner, msg.sender, amount);
        emit Redeemed(owner, msg.sender, amount, code);
    }

    function getAllRedemptionCodes() external view returns (string[] memory) {
        return allRedemptionCodes;
    }
}
