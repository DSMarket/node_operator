import { createHelia } from 'helia';
import { Libp2pOptions } from '../config/libp2p.js';
import { createLibp2p } from 'libp2p';
//import * as dotenv from 'dotenv';
//dotenv.config();

export default async function initHelia() {
  // ToDo add logic to import privKey if exists
  // if not generate new and store it.
  try {
    const libp2p = await createLibp2p(Libp2pOptions);
    const ipfs = await createHelia({ libp2p });
    return ipfs;
  } catch (error) {
    console.error('Error fetching CCDBAddress:', error);
    return '';
  }
}


//async function main() {
//    
//    const providerUrl = process.env.PROVIDER_URL;
//
//    if(providerUrl){
//        try {
//            const nodeAddress: string = await getNodeOperatorAddress(providerUrl);
//            console.log('Greeting from contract:', nodeAddress);
//        } catch (error) {
//            console.error('Error:', error);
//        }
//    } else {
//        console.error("couldn't get provider from the .env")
//    }
//}
//
//main();
