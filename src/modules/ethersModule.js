import { ethers, Contract } from "ethers";
import SFAJson from "../assets/SFAToken.json" assert { type: "json" };
import MarketJson from "../assets/Market.json" assert { type: "json" };

// Get .env Variables
const envProviderURL = process.env.PROVIDER_URL;
const envSfaContractAddress = process.env.SFA_CONTRACT_ADDRESS;
const envMarketContractAddress = process.env.MARKET_CONTRACT_ADDRESS;
const envPrivateKeys = [
  process.env.PK0,
  process.env.PK1,
  process.env.PK2,
  process.env.PK3,
  process.env.PK4,
  process.env.PK5,
  process.env.PK6,
  process.env.PK7,
  process.env.PK8,
  process.env.PK9,
];

export default async function initEthers(
  pkey,
  provider_url,
  sfa_contract_address,
  market_contract_address
) {
  const privateKey = pkey || envPrivateKeys[0];
  const providerURL = provider_url || envProviderURL;
  const sfaContractAddress = sfa_contract_address || envSfaContractAddress;
  const marketContractAddress =
    market_contract_address || envMarketContractAddress;

  // Initialize provider
  const provider = new ethers.JsonRpcProvider(providerURL);

  // Initialize wallet
  const wallet = new ethers.Wallet(privateKey, provider);

  // Get ABIs
  const abiSFA = SFAJson.abi;
  const abiMarket = MarketJson.abi;

  // Initialize contract
  const contractSFA = new Contract(sfaContractAddress, abiSFA, wallet);

  const contractMarket = new Contract(marketContractAddress, abiMarket, wallet);

  // Return structured object
  return {
    provider,
    wallet,
    contractSFA,
    contractMarket,
    abiSFA,
    abiMarket,
  };
}
