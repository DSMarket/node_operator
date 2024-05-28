/* eslint-disable no-console */
import { HeliaLibp2p } from 'helia';
import { multiaddr } from '@multiformats/multiaddr';
import { Libp2p } from 'libp2p';
//import { PeerID } from '@libp2p/peer-id';
import initEthers from './modules/ethersModule.js';
import initHelia from './modules/heliaModule.js';
import { JsonRpcProvider, Wallet, Contract } from "ethers";

/* ToDO
 [x] test conecting between nodes
 [x] Add and test libp2p ports static
 [x] Add and test connecting websocket libp2p circuitRelayServer
 [x] restructure code
 [ ] create CLI
 [ ] Daemon Setup
 [ ] Ethers-js import wallet from .env
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

let ethStruct: EthersStruct;
let ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>;
//ToDO SOlve
//let dialedPeers: PeerID [];

async function main() {

    try {
      ethStruct = await initEthers();
      ipfs = await initHelia();
      //console.log('Provider:', ethStruct.provider);
      //console.log('Wallet address:', ethStruct.wallet.address);
      //console.log('Contract address:', await ethStruct.contract.getAddress());
      //console.log('ABI:', ethStruct.abi);
    } catch (error) {
      console.error('Error initializing modules:', error);
    }

    getOrder(ethStruct);
    printLocalPeerData(ipfs);


    // IPFS
    //const libp2p = await createLibp2p(Libp2pOptions);
    //ipfs = await createHelia({ libp2p });
    //console.info('Helia is running');
    //console.info('PeerId:', ipfs.libp2p.peerId.toString())

    //const addr = ipfs.libp2p.getMultiaddrs()
    //console.log(addr)


    // TODO dial dns peerIDs
    //let node0 = "/dns4/ipfs.decentralizedscience.org/tcp/4004/ws/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE";
    //let node0 = "/dnsaddr/ipfs.decentralizedscience.org/tcp/4004/ws/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE";
    //let node0 = "/dns4/ipfs.decentralizedscience.org/tcp/443/ws/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE";
    //let node0 = "/dnsaddr/ipfs.decentralizedscience.org/tcp/443/wss/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE";
    //let node0 = "/dnsaddr/ipfs.decentralizedscience.org/p2p/12D3KooWQzickgUJ1N9dNZMJpNnFUCHmhndTVgexXnt6dQhPFcEE"
    
    //let node0 = "/dns4/ipfs.decentralizedscience.org/tcp/443/wss/p2p/";
    
    // local test working
    let node1 = multiaddr("/ip4/10.224.190.150/tcp/4001"); 
    let node2 = multiaddr("/ip4/10.224.190.9/tcp/4001"); 
    let peers = ipfs.libp2p.getPeers()

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
    while(true) {
      peers = ipfs.libp2p.getPeers()
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log(peers)
    }


    //const peer = await ipfs.libp2p.peerStore.get(ipfs.libp2p.dial)
    //const peer = await ipfs.libp2p.peerStore.get(ipfs.libp2p.dial)
    //await ipfs.libp2p.dial(node0);
    //await ipfs.libp2p.hangUp(node0_ma)
    //await ipfs.libp2p.hangUp(node1_ma)
    //await ipfs.stop()
}

main();

async function getOrder(ethStruct: EthersStruct){
  // Add logic 
  const nodeAddress: string = await ethStruct.contract._CCDBAddress();
  console.log('Greeting from contract:', nodeAddress);
}

async function printLocalPeerData(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>) {
  console.info('Helia is running');
  console.info('PeerId:', ipfs.libp2p.peerId.toString());
  const addr = ipfs.libp2p.getMultiaddrs();
  console.log(addr);
}

//async function printDialedPeers(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>) {
//    dialedPeers = ipfs.libp2p.getPeers();
//}

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
//async function closeHelia(ipfs: HeliaLibp2p<Libp2p<{ x: Record<string, unknown>}>>) {
//  await ipfs.stop()
//}



