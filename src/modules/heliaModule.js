const { createHelia } = require("helia");
const { unixfs } = require("@helia/unixfs");
const { Libp2pOptions } = require("../config/libp2p.js");
const { createLibp2p } = require("libp2p");

export default async function initHelia() {
  // ToDo add logic to import privKey if exists
  // if not generate new and store it.
  try {
    const libp2p = await createLibp2p(Libp2pOptions);
    const node = await createHelia({ libp2p });
    const fs = unixfs(node);
    return { node, fs };
  } catch (error) {
    console.error("Error setting up helia", error);
  }
}
