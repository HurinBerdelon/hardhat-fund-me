const networkConfigs = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

async function deployFunc(hre) {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress

    // if the contract doesn't exist, we deploy a minimal version for our local testing
    if (networkConfigs.developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress =
            networkConfigs.networkConfig[chainId].ethUsdPriceFeed
    }

    //
    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args, // put priceFeed here
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !networkConfigs.developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("________________________________________________")
}

module.exports = deployFunc

module.exports.tags = ["all", "fundMe"]
