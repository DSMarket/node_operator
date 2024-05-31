import { ethers, Contract } from "ethers";
import * as dotenv from 'dotenv';
import SFAJson from '../assets/SFAToken.json' assert { type: 'json' };
import MarketJson from '../assets/Market.json' assert { type: 'json' };
dotenv.config();

export default async function initEthers() {
  // Get .env Variables
  const providerURL = process.env.PROVIDER_URL;
  const sfa_contract_address = process.env.SFA_CONTRACT_ADDRESS;
  const market_contract_address = process.env.MARKET_CONTRACT_ADDRESS;
  const privateKey = process.env.PKEY;

  // Initialize provider
  const provider = new ethers.JsonRpcProvider(providerURL);

  // Initialize wallet
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Get ABIs
  // Contract ABI
  //const abi = [
  //    "function symbol() view returns (string)",
  //    "function decimals() view returns (uint)",
  //    "function _CCDBAddress() view returns (string)"
  //];
  const abiSFA = SFAJson.abi
  const abiMarket = MarketJson.abi

  // Initialize contract
  const contractSFA = new Contract(
      sfa_contract_address,
      abiSFA,
      wallet
  );

  const contractMarket = new Contract(
      market_contract_address,
      abiMarket,
      wallet
  );

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

