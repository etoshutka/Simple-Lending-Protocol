const TonWeb = require("tonweb");
const { mnemonicToKeyPair } = require("tonweb-mnemonic");

async function getPublicKey(mnemonic) {
    try {
        const keyPair = await mnemonicToKeyPair(mnemonic.split(' '));
        return TonWeb.utils.bytesToHex(keyPair.publicKey);
    } catch (error) {
        console.error("Error deriving key pair:", error);
        return null;
    }
}

// Example usage:
const mnemonic = "";
getPublicKey(mnemonic).then(publicKey => {
    if (publicKey) {
        console.log("Public Key:", publicKey);
    } else {
        console.log("Failed to derive public key");
    }
});