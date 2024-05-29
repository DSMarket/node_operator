/* eslint-disable no-console */
import { HeliaLibp2p } from 'helia';
import { multiaddr, isMultiaddr, Multiaddr } from '@multiformats/multiaddr';
import { Libp2p } from 'libp2p';
//import { createPeerId } from '@libp2p/peer-id';
import { PeerId } from '@libp2p/interface';
import initEthers from './modules/ethersModule.js';
import initHelia from './modules/heliaModule.js';
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import * as readline from "readline";


/* ToDO
 [x] test conecting between nodes
 [x] Add and test libp2p ports static
 [x] Add and test connecting websocket libp2p circuitRelayServer
 [x] restructure code
 [x] create CLI
 [x] dial a peer
 [x] hangUp a peer
 [ ] pin local multiaddrs
 [ ] pin a CID
 [ ] unpin a CID
 [ ] update local multiaddrs(add public IP and others)
 [ ] unpin local multiaddrs
 [ ] status report (report taken Orders and pinned files with deadline)
 [ ] take an order and pin (methods and time check)
 [x] Ethers-js import wallet from .env [ ] Test with contracts
 [ ] make peerID static or import (not priority)
 [ ] setup dns resolver (not priority)
*/

interface EthersStruct { provider: JsonRpcProvider;
    wallet: Wallet;
    contract: Contract;
    abi: any[];
}

let eth: EthersStruct;
let ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>;
let dialedPeers: PeerId [];
//ToDO SOlve

async function main() {

    // Setup and Initialize 
    try {
        console.log("initializing Ethers");
        await new Promise(resolve => setTimeout(resolve, 1000));
        eth = await initEthers();
        console.log("Ethers Ready!");
        console.log("initializing Helia");
        await new Promise(resolve => setTimeout(resolve, 1000));
        ipfs = await initHelia();
        console.log("Helia Ready!");
    } catch (error) {
        console.error('Error initializing modules:', error);
    }

    // Start CLI
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    mainMenu(rl);

    //const peer = await ipfs.libp2p.peerStore.get(ipfs.libp2p.dial)
    //const peer = await ipfs.libp2p.peerStore.get(ipfs.libp2p.dial)
    //await ipfs.libp2p.dial(node0);
    //await ipfs.libp2p.hangUp(node0_ma)
    //await ipfs.libp2p.hangUp(node1_ma)
    //await ipfs.stop()
}

async function mainMenu(rl: readline.Interface) {
  menuOptions(rl);
}

function menuOptions(rl: readline.Interface) {
  rl.question("Select operation: \n \
Options: \n \
[0]: Exit \n \
[1]: PrintMenu \n \
[2]: Get Local Node Info \n \
[3]: Get Eth linked Data\n \
[4]: Get Storage Orders\n \
[5]: Get Dialed IPFS Peers\n \
[6]: Dial a Peer\n \
[7]: Hang Up a Peer\n \
Option:",
    async (answer: string) => {
      console.log(`Selected: ${answer}\n`);
      const option = Number(answer);
      switch (option) {
        case 0:
          closeHelia(ipfs);
          rl.close();
          return;
        case 1:
          mainMenu(rl);
          return;
        case 2:
          await printLocalPeerData(ipfs);
          mainMenu(rl);
          break;
        case 3:
          await printEthStruct(eth);
          mainMenu(rl);
          break;
        case 4:
          await getStorageOrders(eth);
          mainMenu(rl);
          break;
        case 5:
          await printDialedPeers(ipfs);
          mainMenu(rl);
          break;
        case 6:
            rl.question("please input the peer multiaddrs:", async (addrs) => {
            await DialAPeer(ipfs, addrs);
            mainMenu(rl);
          });
          break;
        case 7:
            await printNumerableDialedPeers(ipfs);
            rl.question("please input a number to hangHup:", async (addrs) => {
            await hangUpAPeer(addrs);
            mainMenu(rl);
          });
          break;
        default:
          throw new Error("Invalid option");
      }
    }
  );
}

async function getStorageOrders(eth: EthersStruct){
  // Add logic 
  const nodeAddress: string = await eth.contract._CCDBAddress();
  console.log('Greeting from contract:', nodeAddress);
}

async function printLocalPeerData(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>) {
  console.info('Helia is running');
  console.info('PeerId:', ipfs.libp2p.peerId.toString());
  console.info('MultiAddress of this Node:');
  const addr = ipfs.libp2p.getMultiaddrs();
  console.log(addr);
}
async function printEthStruct(eth: EthersStruct) {
    console.log('Provider:', eth.provider);
    console.log('Wallet address:', eth.wallet.address);
    console.log('Contract address:', await eth.contract.getAddress());
    console.log('ABI:', eth.abi);
}

async function printDialedPeers(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>) {
    dialedPeers = ipfs.libp2p.getPeers();
    console.log("The following peers are dialing:");
    console.log(dialedPeers);
}


async function DialAPeer(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>,
                          addrs: string) { 
    // ToDo: Use isName to check dns strings
    const peerMultiAddr = multiaddr(addrs);
    try  {
        if(isMultiaddr(peerMultiAddr)){
            await ipfs.libp2p.dial(peerMultiAddr);
            console.log("dialed:", peerMultiAddr); 
        }
    } catch(error) {
       console.log("Error: ", error); 
    }
}

async function printNumerableDialedPeers(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>) {
    dialedPeers = ipfs.libp2p.getPeers();
    for(let [index, element] of dialedPeers.entries()){
        console.log(`${index} is peerID: ${element.toString()}`);
    }
}

// This is mostly for sentinels since they are not public nodes
// Usually if there is a dicovery like mDNS and/or
// the peer is dialing it will reconect
async function hangUpAPeer(number: string) {
    let hangUpPeerId = dialedPeers[number];
    //let hangUpPeerId = dialedPeers[number].toString();
    try {
        await ipfs.libp2p.hangUp(hangUpPeerId);
        console.log(`peerID: ${hangUpPeerId.toString()},\n hanged Up`);
        //await ipfs.libp2p.hangUp(multiaddr(`/ipfs/${hangUpPeerId}`));
        //console.log(`peerID: ${hangUpPeerId},\n hanged Up`);
    } catch(error){
       console.log("Error: ", error); 
    }
}

async function closeHelia(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>) {
  console.log("Closing session...")
  await ipfs.stop()
  console.log("Good bye ;)")
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

