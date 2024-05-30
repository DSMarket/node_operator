/* eslint-disable no-console */
import { HeliaLibp2p } from 'helia';
//import { pin, unpin } from 'helia/pin';
import { UnixFS } from '@helia/unixfs';
import { multiaddr, isMultiaddr, Multiaddr } from '@multiformats/multiaddr';
import { CID } from 'multiformats/cid'
import { Libp2p } from 'libp2p';
import { peerIdFromString } from '@libp2p/peer-id';
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
 [x] dial a multiaddr
 [x] dial a peerID ( conversion issues)*ToAsk
 [x] hangUp a peer (unknown if works)*ToAsk
 [x] add Data method
 [x] get Data method
 [ ] take an order and pin (methods and time check)
 [ ] pin a CID
 [ ] unpin a CID
 [ ] pin local multiaddrs
 [ ] update local multiaddrs(add public IP and others)
 [ ] unpin local multiaddrs
 [ ] status report (report taken Orders and pinned files with deadline)
 [x] Ethers-js import wallet from .env [ ] Test with contracts
 [ ] make peerID static or import (not priority) *ToAsk
 [ ] setup dns resolver (not priority)
*/

interface EthersStruct {
    provider: JsonRpcProvider;
    wallet: Wallet;
    contract: Contract;
    abi: any[];
}

interface ipfsStruct {
    node: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>;
    fs: UnixFS;
}

//interface storageOrder {
//    orderID: string;
//    makerAddrs: string;
//    data: string;
//    TTL: string;
//}

let eth: EthersStruct;
let ipfs: ipfsStruct;
let dialedPeers: PeerId [];
let storageOrders: CID[] = [];

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
[6]: Dial a Multiaddrs\n \
[7]: Dial a PeerID\n \
[8]: Hang Up a Peer\n \
[9]: Print Active Orders\n \
[10]: Publish Data\n \
[11]: Get Data\n \
[12]: Pin CID\n \
[13]: Unpin CID\n \
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
            await DialAMultiaddr(ipfs, addrs);
            mainMenu(rl);
          });
          break;
        case 7:
          rl.question("please input the peerID:", async (addrs) => {
            await DialAPeerID(ipfs, addrs);
            mainMenu(rl);
          });
          break;
        case 8:
            await printNumerableDialedPeers(ipfs);
            rl.question("please input a number to hangHup:", async (addrs) => {
            await hangUpAPeer(ipfs, addrs);
            mainMenu(rl);
          });
          break;
        case 9:
          await printNumerableOrders();
          mainMenu(rl);
          break; 
        case 10:
            rl.question("please input Data:", async (data) => {
            await pushData(ipfs, data);
            mainMenu(rl);
          });
          break;
        case 11:
            await printNumerableOrders();
            rl.question("please input a number of Order:", async (order) => {
            await getData(ipfs, order);
            mainMenu(rl);
          });
          break;
        case 12:
            rl.question("please input CID to pin:", async (cidString) => {
            await pinCID(ipfs, cidString);
            mainMenu(rl);
          });
          break;
        case 13:
            await printNumerableOrders();
            rl.question("please input a number to upin:", async (index) => {
            await unPinCID(ipfs, index);
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

async function printLocalPeerData(ipfs: ipfsStruct) {
  console.info('Helia is running');
  console.info('PeerId:', ipfs.node.libp2p.peerId.toString());
  console.info('MultiAddress of this Node:');
  const addr = ipfs.node.libp2p.getMultiaddrs();
  console.log(addr);
}
async function printEthStruct(eth: EthersStruct) {
    console.log('Provider:', eth.provider);
    console.log('Wallet address:', eth.wallet.address);
    console.log('Contract address:', await eth.contract.getAddress());
    console.log('ABI:', eth.abi);
}

async function printDialedPeers(ipfs: ipfsStruct) {
    dialedPeers = ipfs.node.libp2p.getPeers();
    console.log("The following peers are dialing:");
    console.log(dialedPeers);
}


async function DialAPeerID(ipfs: ipfsStruct, peer: string) { 
    // Check tipes and merge reduce code duplication with dialMulltiaddr
    // ToDo: Use isName to check dns strings
    try{
        console.log("going to dial:{peer}"); 
        const dialPeerID = peerIdFromString(peer);
        await ipfs.node.libp2p.dial(dialPeerID);
        console.log("dialed:", dialPeerID); 
    } catch(error) {
       console.log("Error: ", error); 
    }
}

async function DialAMultiaddr(ipfs: ipfsStruct, addrs: string) { 
    // ToDo: Use isName to check dns strings
    const peerMultiAddr = multiaddr(addrs);
    try  {
        if(isMultiaddr(peerMultiAddr)){
            await ipfs.node.libp2p.dial(peerMultiAddr);
            console.log("dialed:", peerMultiAddr); 
        }
    } catch(error) {
       console.log("Error: ", error); 
    }
}

async function printNumerableDialedPeers(ipfs: ipfsStruct) {
    dialedPeers = ipfs.node.libp2p.getPeers();
    for(let [index, element] of dialedPeers.entries()){
        console.log(`${index} is peerID: ${element.toString()}`);
    }
}

// This is mostly for sentinels since they are not public nodes
// Usually if there is a dicovery like mDNS and/or
// the peer is dialing it will reconect
// ToDO check how to block peers
async function hangUpAPeer(ipfs: ipfsStruct, index: string) {
    let hangUpPeerId = dialedPeers[index];
    //let hangUpPeerId = dialedPeers[index].toString();
    try {
        await ipfs.node.libp2p.hangUp(hangUpPeerId);
        console.log(`peerID: ${hangUpPeerId.toString()},\n hanged Up`);
        //await ipfs.node.libp2p.hangUp(multiaddr(`/ipfs.node/${hangUpPeerId}`));
        //console.log(`peerID: ${hangUpPeerId},\n hanged Up`);
    } catch(error){
       console.log("Error: ", error); 
    }
}

async function printNumerableOrders() {
    // TODO: Add pinned status ans structs
    for(let [index, element] of storageOrders.entries()){
        console.log(`${index} order has CID: ${element.toString()}`);
    }
 //   try{
 //       if(storageOrders.length > 0){
 //           for(let [index, element] of storageOrders.entries()){
 //               console.log(`${index} is peerID: ${element.toString()}`);
 //           }
 //       } else {
 //        console.log("No Orders Stored"); 
 //       }
 //   } catch(error) {
 //      console.log("Error: ", error); 
 //   }
}

// This puts data into the Helia Node
async function pushData(ipfs: ipfsStruct, data: string ) {
    const encoder = new TextEncoder();
    const cid = await ipfs.fs.addBytes(encoder.encode(data), {
        onProgress: (evt) => {
            console.info('add event', evt.type, evt.detail)
        }
    })
    storageOrders.push(cid); 
    console.log('Added file:', cid.toString()) 
}

// This gets data from the Helia Node and decodes it
async function getData(ipfs: ipfsStruct, orderIdx: string) {
    // this decoder will turn Uint8Arrays into strings
    const decoder = new TextDecoder()
    const selectedOrder = storageOrders[orderIdx];
    let text = ''

    for await (const chunk of ipfs.fs.cat(selectedOrder, {
        onProgress: (evt) => {
            console.info('cat event', evt.type, evt.detail)
        }
    })) {
        text += decoder.decode(chunk, {
            stream: true
        })
    }

    console.log(`Data from: ${selectedOrder.toString()}`);
    console.log(text)
    //return text
}

async function pinCID(ipfs: ipfsStruct, cidString: string ) {
    const cid2Pin = CID.parse(cidString); 
    //retrive from nodes the cid2Pin
    //await pin(cid2Pin)(ipfs.node);
    // Pin in the local memory storage
    ipfs.node.pins.add(cid2Pin)
    storageOrders.push(cid2Pin)
    console.log('pinned CID:', cidString) 
}

// for now is local CID
async function unPinCID(ipfs: ipfsStruct, index: string ) {
    const idxNum: number = +index;
    let cid2Unpin = storageOrders[index];
    try {
        //await unpin(cid2Unpin)(ipfs.node) 
        ipfs.node.pins.rm(cid2Unpin);
        if (idxNum > -1 && idxNum < storageOrders.length) {
            storageOrders.splice(idxNum, 1);
            console.log(`Unpinned CID: ${cid2Unpin.toString()}`);
        }
    } catch(error){
       console.log("Error: ", error); 
    }
}

async function closeHelia(ipfs: ipfsStruct) {
  console.log("Closing session...")
  await ipfs.node.stop()
  console.log("Good bye ;)")
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

