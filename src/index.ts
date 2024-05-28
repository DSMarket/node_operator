/* eslint-disable no-console */
import { HeliaLibp2p } from 'helia';
import { multiaddr } from '@multiformats/multiaddr';
import { Libp2p } from 'libp2p';
//import { PeerID } from '@libp2p/peer-id';
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
 [ ] hangUp a peer
 [ ] take an order and pin (methods and time check)
 [x] Ethers-js import wallet from .env
 [ ] Test with contracts
 [ ] make peerID static or import (not priority)
 [ ] setup dns resolver (not priority)
*/

interface EthersStruct {
    provider: JsonRpcProvider;
    wallet: Wallet;
    contract: Contract;
    abi: any[];
}

let eth: EthersStruct;
let ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>;
//ToDO SOlve
//let dialedPeers: PeerID [];

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

    // TODO dial dns peerIDs
    //let node0 = "/dns4/ipfs.decentralizedscience.org/tcp/4004/ws/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE";
    //let node0 = "/dnsaddr/ipfs.decentralizedscience.org/tcp/4004/ws/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE";
    //let node0 = "/dns4/ipfs.decentralizedscience.org/tcp/443/ws/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE";
    //let node0 = "/dnsaddr/ipfs.decentralizedscience.org/tcp/443/wss/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE";
    //let node0 = "/dnsaddr/ipfs.decentralizedscience.org/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE"
    
    //let node0 = "/dns4/ipfs.decentralizedscience.org/tcp/443/wss/p2p/";
    
    // local test working
    //let node1 = multiaddr("/ip4/10.224.190.150/tcp/4001"); 
    //let node2 = multiaddr("/ip4/10.224.190.9/tcp/4001"); 
    //let peers = ipfs.libp2p.getPeers()

    // dialer client nodes
    //while(peers.length < 1) {
    //  peers = ipfs.libp2p.getPeers()
    //  try {
    //    await ipfs.libp2p.dial(node1);
    //    await ipfs.libp2p.dial(node2);
    //  } catch (error) {
	//  console.log(error);
    //  }
    //  await new Promise(resolve => setTimeout(resolve, 3000));
    //}
    //console.log(peers)
    
    // Node Daemon Running and printing solved peers
    //while(true) {
    //  peers = ipfs.libp2p.getPeers()
    //  await new Promise(resolve => setTimeout(resolve, 3000));
    //  console.log(peers)
    //}


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
  rl.question(
    "Select operation: \n \
    Options: \n \
    [0]: Exit \n \
    [1]: PrintMenu \n \
    [2]: Get Local Node Info \n \
    [3]: Get Eth linked Data\n \
    [4]: Get Storage Orders\n \
    [5]: Get Dialed IPFS Peers\n \
    Option:",
    // Just in case: IPFS integration of Option 3 - upload songs, put their hashes and premit to some addeses this songs
    // VoteNextSong: set a blocktimestap when it finishes and count votes, select the winner
    // Diplay Song: Request all the SongID (NFT TokenID) and display with their data
    // Vote Song: requires the blocktimestamp to be active, requires to record addreses that vote in a mapping with votes and specific songID
    // Add Winner Song: Queue Winnersongs with timestamps
    // Play Winner Song: Anyone can play Winner Song when its timestamp reaches the time
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
    const dialedPeers = ipfs.libp2p.getPeers();
    console.log("The following peers are dialing:")
    console.log(dialedPeers)
}

//async function DialAPeer(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>,
//                          peerID: String) {
//}
//async function hangUpAPeer(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>,
//                          peerID: String) {
//}
//
//async function unlinkAPeer(){
//  await ipfs.libp2p.hangUp(node1_ma)
//}
//
async function closeHelia(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>) {
  console.log("Closing session...")
  await ipfs.stop()
  console.log("Good bye ;)")
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

