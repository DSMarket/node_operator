/* eslint-disable no-console */
import { HeliaLibp2p } from 'helia';
import { formatUnits, formatEther, parseUnits, parseEther } from 'ethers';
import { UnixFS } from '@helia/unixfs';
import { multiaddr, isMultiaddr } from '@multiformats/multiaddr';
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
 [x] create CLI [x] dial a multiaddr
 [x] dial a peerID ( conversion issues)*ToAsk
 [x] hangUp a peer (unknown if works)*ToAsk
 [x] add Data method
 [x] get Data method
 [ ] take an order and pin (methods and time check)
 [x] pin a CID
 [x] unpin a CID
 [ ] pin local multiaddrs
 [ ] update local multiaddrs(add public IP and others)
 [ ] unpin local multiaddrs
 [ ] status report (report taken Orders and pinned files with deadline)
 [x] Ethers-js import wallet from .env [ ] Test with contracts
 [x] Integrate ABI from contracts and test
 [ ] build methods for operations with blockchain
 [ ] make peerID static or import (not priority) *ToAsk
 [ ] setup dns resolver (not priority)
 [ ] Add error handling
 [ ] Move functions to modules
*/

interface EthersStruct {
    provider: JsonRpcProvider;
    wallet: Wallet;
    contractSFA: Contract;
    contractMarket: Contract;
    abiSFA: any[];
    abiMarket: any[];
}

interface ipfsStruct {
    node: HeliaLibp2p<Libp2p<{ x: Record<string, unknown> }>>;
    fs: UnixFS;
}

interface Host {
    status: string
    multiAddrs: string
}

//interface SFA {
//    ownerAddrs: string;
//    sfaID: string;
//    vesting: string
//    cid: CID;
//    startTime: string;
//    TTL: string;
//}

let eth: EthersStruct;
let ipfs: ipfsStruct;
let dialedPeers: PeerId[];
let storageOrders: CID[] = [];
//let SFAs: SFA[] = [];

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
}

async function mainMenu(rl: readline.Interface) {
    menuOptions(rl);
}

function menuOptions(rl: readline.Interface) {
    rl.question("Select operation: \n \
Options: \n \
[0]: Exit \n \
[1]: Print menu \n \
[2]: Get local node info \n \
[3]: Get eth linked data\n \
[4]: Get smart contract taken orders\n \
[5]: List dialed peers\n \
[6]: Dial a multiaddrs\n \
[7]: Dial a peerId\n \
[8]: Hang up a peerId\n \
[9]: List active orders\n \
[10]: Publish Data to IPFS\n \
[11]: Read IPFS Data\n \
[12]: Pin a CID\n \
[13]: Unpin a CID\n \
[14]: Account Blance\n \
[15]: Change Wallet\n \
[16]: Register & Dial Host\n \
[17]: Fetch & Dial Host\n \
[18]: Transfer Tokens\n \
[19]: Transfer ETH\n \
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
                    printNumerableDialedPeers(ipfs);
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
                case 14:
                    await balanceERC20(eth);
                    mainMenu(rl);
                    break;
                case 15:
                    rl.question("please input a private key:", async (pKey) => {
                        await importPKey(pKey);
                        mainMenu(rl);
                    });
                    break;
                case 16:
                    rl.question("please input a host multiaddr:", async (addrs) => {
                        await registerHost(eth, ipfs, addrs);
                        mainMenu(rl);
                    });
                    break;
                case 17:
                    rl.question("please input a host eth Address:", async (addrs) => {
                        await fetchHost(eth, ipfs, addrs);
                        mainMenu(rl);
                    });
                    break;
                case 18:
                    rl.question("please input an Ethereum Address:", async (to) => {
                      rl.question("please input the Tokens amount:", async (amount) => {
                        await transferTokens(eth, to, amount);
                        await balanceERC20(eth);
                        mainMenu(rl);
                      });
                    });
                    break;
                case 19:
                    rl.question("please input an Ethereum Address:", async (to) => {
                      rl.question("please input the ETH amount:", async (amount) => {
                        await transferETH(eth, to, amount);
                        await balanceERC20(eth);
                        mainMenu(rl);
                      });
                    });
                    break;
                default:
                    throw new Error("Invalid option");
            }
        }
    );
}

async function getStorageOrders(eth: EthersStruct) {
    // Add logic 
    const sfaAddress: string = await eth.contractSFA.getAddress();
    console.log('Greeting from contract SFA:', sfaAddress);
    const marketAddress: string = await eth.contractMarket.getAddress();
    console.log('Greeting from contract Market:', marketAddress);
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
    console.log('SFA address:', await eth.contractSFA.getAddress());
    console.log('Market Contract address:', await eth.contractMarket.getAddress());
    //console.log('ABI:', eth.abiSFA);
    //console.log('ABI:', eth.abiMarket);
}

async function printDialedPeers(ipfs: ipfsStruct) {
    dialedPeers = ipfs.node.libp2p.getPeers();
    console.log("The following peers are dialing:");
    console.log(dialedPeers);
}


async function DialAPeerID(ipfs: ipfsStruct, peer: string) {
    // Check tipes and merge reduce code duplication with dialMulltiaddr
    // ToDo: Use isName to check dns strings
    try {
        console.log("Dialing {peer}...");
        const dialPeerID = peerIdFromString(peer);
        await ipfs.node.libp2p.dial(dialPeerID);
        console.log("OK: dialed:", dialPeerID);
    } catch (error) {
        console.log("Error: ", error);
    }
}

async function DialAMultiaddr(ipfs: ipfsStruct, addrs: string) {
    // ToDo: Use isName to check dns strings
    const peerMultiAddr = multiaddr(addrs);
    try {
        if (isMultiaddr(peerMultiAddr)) {
            await ipfs.node.libp2p.dial(peerMultiAddr);
            console.log("dialed:", peerMultiAddr);
        }
    } catch (error) {
        console.log("Error: ", error);
    }
}

function printNumerableDialedPeers(ipfs: ipfsStruct): void {
    dialedPeers = ipfs.node.libp2p.getPeers();
    for (let [index, element] of dialedPeers.entries()) {
        console.log(`${index} is peerID: ${element.toString()}`);
    }
}

async function hangUpAPeer(ipfs: ipfsStruct, index: string) {
    let hangUpPeerId = dialedPeers[index];
    try {
        await ipfs.node.libp2p.hangUp(hangUpPeerId);
        console.log(`peerID: ${hangUpPeerId.toString()},\n hanged Up`);
    } catch (error) {
        console.log("Error: ", error);
    }
}

async function printNumerableOrders() {
    // TODO: Add pinned status ans structs
    // verify with blockchain
    try {
        if (storageOrders.length > 0) {
            for (let [index, element] of storageOrders.entries()) {
                console.log(`${index} order has CID: ${element.toString()}`);
            }
        } else {
            console.log("No Stored Orders");
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

// This puts data into the Helia Node
async function pushData(ipfs: ipfsStruct, data: string) {
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
    console.log(text);
    //return text
}

async function pinCID(ipfs: ipfsStruct, cidString: string) {
    const cid2Pin = CID.parse(cidString);
    try {
        ipfs.node.pins.add(cid2Pin);
        storageOrders.push(cid2Pin);
        console.log('pinned CID:', cidString);
    } catch (error) {
        console.log("Pinning CID Error:", error);
    }
}

// for now is local CID
async function unPinCID(ipfs: ipfsStruct, index: string) {
    const idxNum: number = +index;
    let cid2Unpin = storageOrders[index];
    try {
        ipfs.node.pins.rm(cid2Unpin);
        if (idxNum > -1 && idxNum < storageOrders.length) {
            storageOrders.splice(idxNum, 1);
            console.log(`Unpinned CID: ${cid2Unpin.toString()}`);
        }
    } catch (error) {
        console.log("Error: ", error);
    }
}

async function closeHelia(ipfs: ipfsStruct) {
    console.log("Closing session...")
    await ipfs.node.stop()
    console.log("Good bye ;)")
}

// Protocol Functions
async function balanceERC20(eth: EthersStruct, address?: string) {
    console.log("EOAccount is:", eth.wallet.getAddress())
    const walletAddress = address || eth.wallet.getAddress();
    const decimals = await eth.contractSFA.decimals()
    const sfaBalance = await eth.contractSFA.balanceOf(walletAddress);
    console.log("SFA Balance:", formatUnits(sfaBalance.toString(), decimals))
    const ethBalance = await eth.provider.getBalance(walletAddress)
    console.log("ETH Balance:", formatEther(ethBalance));
}

async function importPKey(pKey: string) {
    try {
        eth = await initEthers(pKey);
        console.log("new EOAccount is:", eth.wallet.getAddress());
    } catch (error) {
        console.log("Error on importPKey:", error);
    }
}

async function registerHost(
    eth: EthersStruct,
    ipfs: ipfsStruct,
    multiAddrs: string) {

    try {
        const tx = await eth.contractMarket.registerHost(multiAddrs)
        const receipt = await tx.wait();
        // ToDO Catch Error if reverted and do not dial
        console.log(`The host was registered (${receipt.transactionHash})`);
        // dial host (must be accessible multiaddrs)
        await DialAMultiaddr(ipfs, multiAddrs);
    } catch (error) {
        console.log("Error at Host Registry:", error);
    }
}


async function fetchHost(eth: EthersStruct, ipfs: ipfsStruct, addrs: string) {
    try {
        const result = await eth.contractMarket.hosts(addrs);
        const host: Host = {
            status: result[0],
            multiAddrs: result[1]
        };
        console.log("Host Status:", host.status);
        console.log("Host Multiaddress:", host.multiAddrs);
        // ask if you want to dial from outside cli?
        if (host) {
            await DialAMultiaddr(ipfs, host.multiAddrs);
        }
    } catch (error) {
        console.log("Error at fetching a host:", error);
    }
}

//Transfer ERC20
async function transferTokens(
    eth: EthersStruct,
    to: string,
    amount: string
) {
    const decimals = await eth.contractSFA.decimals()
    const tokenAmount = parseUnits(amount, decimals);
    try {
      const tx = await eth.contractSFA.transfer(to, tokenAmount);
      const receipt = await tx.wait();
      console.log(`The tokens where sent on TxID: (${receipt.transactionHash})`); 
    } catch (error) {
        console.log("Error transfering tokens:", error);
    }
}

//Transfer ETH
async function transferETH(
    eth: EthersStruct,
    to: string,
    amount: string
) {
    const value = parseEther(amount);
    const tx = {
        to: to,
        value: value,
    };
    try {
      const txResponse = await eth.wallet.sendTransaction(tx);
      const receipt = await txResponse.wait();
      console.log(`The ${value} ETH where sent to ${to}\n  on TxID: (${receipt})`); 
    } catch (error) {
        console.log("Error transfering ETH:", error);
    }
}

// ToDo and test
// SFA Logic To Test, right now only stores CID for Proof of COncept
async function createSFA(
    eth: EthersStruct,
    ipfs: ipfsStruct,
    vesting: string,
    cid: string,
    startTime: string,
    ttl: string) {
    try {
        const tx = await eth.contractMarket.createSFA(cid, vesting, startTime, ttl)
        const receipt = await tx.wait();
        console.log(`SFA was registered on (${receipt.transactionHash})`);
        // INSTEAD USE SFAs but requires lots of change in all the code.
        const cid2Pin = CID.parse(cid);
        ipfs.node.pins.add(cid2Pin);
        storageOrders.push(cid2Pin);
        console.log('pinned CID:', cid2Pin);
    } catch (error) {
        console.log("Error at Host Registry:", error);
    }
}

// ToDo and test
// Similar to fetchHost?
//async function getSFA(){
//}
//


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

