import { ethers, Contract } from "ethers";
import * as dotenv from 'dotenv';
dotenv.config();

export default async function initEthers() {
  // Get .env Variables
  const providerURL = process.env.PROVIDER_URL;
  const contract_address = process.env.CONTRACT_ADDRESS;
  const privateKey = process.env.PKEY;

  // Initialize provider
  const provider = new ethers.JsonRpcProvider(providerURL);

  // Initialize wallet
  const wallet = new ethers.Wallet(privateKey, provider);

  // Contract ABI
  const abi = [
      "function symbol() view returns (string)",
      "function decimals() view returns (uint)",
      "function _CCDBAddress() view returns (string)"
  ];

  // Initialize contract
  const contract = new Contract(
      contract_address,
      abi, 
      wallet
  );

  // Return structured object
  return {
      provider,
      wallet,
      contract,
      abi,
  };
}

