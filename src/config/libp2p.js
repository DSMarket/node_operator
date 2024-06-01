const { tcp } = require("@libp2p/tcp");
const { identify } = require("@libp2p/identify");
const { gossipsub } = require("@chainsafe/libp2p-gossipsub");
const { noise } = require("@chainsafe/libp2p-noise");
const { yamux } = require("@chainsafe/libp2p-yamux");
const { mdns } = require("@libp2p/mdns");
const { webSockets } = require("@libp2p/websockets");
const filters = require("@libp2p/websockets/filters");
const { circuitRelayServer } = require("@libp2p/circuit-relay-v2");
const { MemoryDatastore } = require("datastore-core");

const datastore = new MemoryDatastore();

export const Libp2pOptions = {
  datastore,
  peerDiscovery: [mdns()],
  addresses: {
    listen: ["/ip4/0.0.0.0/tcp/4001", "/ip4/0.0.0.0/tcp/4004/ws"],
  },
  transports: [
    tcp(),
    webSockets({
      filter: filters.all,
    }),
  ],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    relay: circuitRelayServer(),
  },
};
