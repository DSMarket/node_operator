/* eslint-disable no-console */
const { HeliaLibp2p } = require("helia");
const { formatUnits, formatEther } = require("ethers");
const { UnixFS } = require("@helia/unixfs");
const { multiaddr, isMultiaddr } = require("@multiformats/multiaddr");
const { CID } = require("multiformats/cid");
const { Libp2p } = require("libp2p");
const { peerIdFromString } = require("@libp2p/peer-id");
const { PeerId } = require("@libp2p/interface");
const initEthers = require("./modules/ethersModule.js");
const initHelia = require("./modules/heliaModule.js");
const { JsonRpcProvider, Wallet, Contract } = require("ethers");
const readline = require("readline");

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

// interface EthersStruct {
//   provider: JsonRpcProvider;
//   wallet: Wallet;
//   contractSFA: Contract;
//   contractMarket: Contract;
//   abiSFA: any[];
//   abiMarket: any[];
// }

// interface ipfsStruct {
//   node: HeliaLibp2p<Libp2p<{ x: Record<string, unknown> }>>;
//   fs: UnixFS;
// }

//interface SFA {
//    ownerAddrs: string;
//    sfaID: string;
//    vesting: string
//    cid: CID;
//    startTime: string;
//    TTL: string;
//}

// let eth: EthersStruct;
// let ipfs: ipfsStruct;
// let dialedPeers: PeerId[];
// let storageOrders: CID[] = [];
//let SFAs: SFA[] = [];

const EthersStruct = {
  provider: JsonRpcProvider,
  wallet: Wallet,
  contractSFA: Contract,
  contractMarket: Contract,
  abiSFA: [],
  abiMarket: [],
};

const ipfsStruct = {
  node: HeliaLibp2p,
  fs: UnixFS,
};

let eth;
let ipfs;
let dialedPeers = [];
let storageOrders = [];

const main = async () => {
  // Setup and Initialize
  try {
    console.log("initializing Ethers");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    eth = await initEthers();
    console.log("Ethers Ready!");
    console.log("initializing Helia");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ipfs = await initHelia();
    console.log("Helia Ready!");
  } catch (error) {
    console.error("Error initializing modules:", error);
  }

  // Start CLI
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  mainMenu(rl);
};

const mainMenu = async (rl) => {
  menuOptions(rl);
};

const menuOptions = (rl) => {
  rl.question(
    "Select operation: \n \
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
Option:",
    async (answer) => {
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
        default:
          throw new Error("Invalid option");
      }
    }
  );
};

const getStorageOrders = async (eth) => {
  const sfaAddress = await eth.contractSFA.getAddress();
  console.log("Greeting from contract SFA:", sfaAddress);
  const marketAddress = await eth.contractMarket.getAddress();
  console.log("Greeting from contract Market:", marketAddress);
};

const printLocalPeerData = async (ipfs) => {
  console.info("Helia is running");
  console.info("PeerId:", ipfs.node.libp2p.peerId.toString());
  console.info("MultiAddress of this Node:");
  const addr = ipfs.node.libp2p.getMultiaddrs();
  console.log(addr);
};

const printEthStruct = async (eth) => {
  console.log("Provider:", eth.provider);
  console.log("Wallet address:", eth.wallet.address);
  console.log("SFA address:", await eth.contractSFA.getAddress());
  console.log(
    "Market Contract address:",
    await eth.contractMarket.getAddress()
  );
};

const printDialedPeers = async (ipfs) => {
  dialedPeers = ipfs.node.libp2p.getPeers();
  console.log("The following peers are dialing:");
  console.log(dialedPeers);
};

const DialAPeerID = async (ipfs, peer) => {
  try {
    console.log("Dialing {peer}...");
    const dialPeerID = peerIdFromString(peer);
    await ipfs.node.libp2p.dial(dialPeerID);
    console.log("OK: dialed:", dialPeerID);
  } catch (error) {
    console.log("Error: ", error);
  }
};

const DialAMultiaddr = async (ipfs, addrs) => {
  const peerMultiAddr = multiaddr(addrs);
  try {
    if (isMultiaddr(peerMultiAddr)) {
      await ipfs.node.libp2p.dial(peerMultiAddr);
      console.log("dialed:", peerMultiAddr);
    }
  } catch (error) {
    console.log("Error: ", error);
  }
};

const printNumerableDialedPeers = (ipfs) => {
  dialedPeers = ipfs.node.libp2p.getPeers();
  for (let [index, element] of dialedPeers.entries()) {
    console.log(`${index} is peerID: ${element.toString()}`);
  }
};

const hangUpAPeer = async (ipfs, index) => {
  let hangUpPeerId = dialedPeers[index];
  try {
    await ipfs.node.libp2p.hangUp(hangUpPeerId);
    console.log(`peerID: ${hangUpPeerId.toString()},\n hanged Up`);
  } catch (error) {
    console.log("Error: ", error);
  }
};

const printNumerableOrders = async () => {
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
};

// This puts data into the Helia Node
const pushData = async (ipfs, data) => {
  const encoder = new TextEncoder();
  const cid = await ipfs.fs.addBytes(encoder.encode(data), {
    onProgress: (evt) => {
      console.info("add event", evt.type, evt.detail);
    },
  });
  storageOrders.push(cid);
  console.log("Added file:", cid.toString());
};

// This gets data from the Helia Node and decodes it
const getData = async (ipfs, orderIdx) => {
  // this decoder will turn Uint8Arrays into strings
  const decoder = new TextDecoder();
  const selectedOrder = storageOrders[orderIdx];
  let text = "";

  for await (const chunk of ipfs.fs.cat(selectedOrder, {
    onProgress: (evt) => {
      console.info("cat event", evt.type, evt.detail);
    },
  })) {
    text += decoder.decode(chunk, {
      stream: true,
    });
  }

  console.log(`Data from: ${selectedOrder.toString()}`);
  console.log(text);
  //return text
};

const pinCID = async (ipfs, cidString) => {
  const cid2Pin = CID.parse(cidString);
  try {
    ipfs.node.pins.add(cid2Pin);
    storageOrders.push(cid2Pin);
    console.log("pinned CID:", cidString);
  } catch (error) {
    console.log("Pinning CID Error:", error);
  }
};

// for now is local CID
const unPinCID = async (ipfs, index) => {
  const idxNum = +index;
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
};

const closeHelia = async (ipfs) => {
  console.log("Closing session...");
  await ipfs.node.stop();
  console.log("Good bye ;)");
};

// Protocol Functions
const balanceERC20 = async (eth, address) => {
  console.log("EOAccount is:", eth.wallet.getAddress());
  const walletAddress = address || eth.wallet.getAddress();
  const decimals = await eth.contractSFA.decimals();
  const sfaBalance = await eth.contractSFA.balanceOf(walletAddress);
  console.log("SFA Balance:", formatUnits(sfaBalance.toString(), decimals));
  const ethBalance = await eth.provider.getBalance(walletAddress);
  console.log("ETH Balance:", formatEther(ethBalance));
};

const importPKey = async (pKey) => {
  try {
    eth = await initEthers(pKey);
    console.log("new EOAccount is:", eth.wallet.getAddress());
  } catch (error) {
    console.log("Error on importPKey:", error);
  }
};

const registerHost = async (eth, ipfs, multiAddrs) => {
  try {
    const tx = await eth.contractMarket.registerHost(multiAddrs);
    const receipt = await tx.wait();
    // ToDO Catch Error if reverted and do not dial
    console.log(`The host was registered (${receipt.transactionHash})`);
    // dial host (must be accessible multiaddrs)
    await DialAMultiaddr(ipfs, multiAddrs);
  } catch (error) {
    console.log("Error at Host Registry:", error);
  }
};

// ToDo and test NoT working Yet.
const fetchHost = async (eth, ipfs, addrs) => {
  try {
    const multiaddrs = await eth.contractMarket.hosts[addrs].multiaddress;
    if (multiaddrs) {
      await DialAMultiaddr(ipfs, multiaddrs);
    }
  } catch (error) {
    console.log("Error at fetching a host:", error);
  }
};

//ToDo allow and transfer ERC20 and maybe eth?
//const transferTokens = async (eth, toAddress) => {
//    //const tx = await eth.wallet.sendTransaction
//}

const createSFA = async (eth, ipfs, vesting, cid, startTime, ttl) => {
  try {
    const tx = await eth.contractMarket.createSFA(cid, vesting, startTime, ttl);
    const receipt = await tx.wait();
    console.log(`SFA was registered on (${receipt.transactionHash})`);
    const cid2Pin = CID.parse(cid);
    ipfs.node.pins.add(cid2Pin);
    storageOrders.push(cid2Pin);
    console.log("pinned CID:", cid2Pin);
  } catch (error) {
    console.log("Error at Host Registry:", error);
  }
};

// ToDo and test
// Similar to fetchHost?
//const getSFA = async () => {
//}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
