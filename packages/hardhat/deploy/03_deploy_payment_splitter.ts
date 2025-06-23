import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, getAddress } from "ethers";

const MOCK_USDC_CONTRACT_ADDRESS = getAddress("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
const VOICE_REGISTRY_CONTRACT_ADDRESS = getAddress("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
const PLATFORM_WALLET_ADDRESS = getAddress("0x7f6aD725a7B43fd3F9cb2C09943f91c4aF822770");

/**
 * Deploys a contract named "PaymentSplitter" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployPaymentSplitter: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("PaymentSplitter", {
    from: deployer,
    // Contract constructor arguments
    args: [MOCK_USDC_CONTRACT_ADDRESS, VOICE_REGISTRY_CONTRACT_ADDRESS, PLATFORM_WALLET_ADDRESS],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const PaymentSplitter = await hre.ethers.getContract<Contract>("PaymentSplitter", deployer);
};

export default deployPaymentSplitter;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags PaymentSplitter
deployPaymentSplitter.tags = ["PaymentSplitter"];
