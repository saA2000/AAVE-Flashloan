// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Flashloan is FlashLoanSimpleReceiverBase {
    event AmountOwed(address asset, uint val);

    constructor(IPoolAddressesProvider provider)
        FlashLoanSimpleReceiverBase(provider)
    {}

    function createFlashloan(address asset, uint256 amount) external {
        address receiver = address(this);
        bytes memory params = "";
        uint16 referalCode = 0;

        POOL.flashLoanSimple(receiver, asset, amount, params, referalCode);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {

        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);
        emit AmountOwed(asset, amountOwed);
        return true;
    }
}
