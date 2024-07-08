const TonWeb = require("tonweb");

async function createUnsignedTransaction() {
    try {
        const tonweb = new TonWeb(new TonWeb.HttpProvider(
            'https://testnet.toncenter.com/api/v2/jsonRPC'));
        const destinationAddress = new TonWeb.Address('kQBiYlOgtCEy4exv1YKbTMx4kU80o8pWXR3X05-rsr8uQ27W');

        const forwardPayload = new TonWeb.boc.Cell();
        forwardPayload.bits.writeUint(0, 32);
        forwardPayload.bits.writeString('Hello, TON!');

        const jettonTransferBody = new TonWeb.boc.Cell();
        jettonTransferBody.bits.writeUint(0xf8a7ea5, 32);
        jettonTransferBody.bits.writeUint(0, 64);
        jettonTransferBody.bits.writeCoins(new TonWeb.utils.BN('5'));
        jettonTransferBody.bits.writeAddress(destinationAddress);
        jettonTransferBody.bits.writeAddress(destinationAddress);
        jettonTransferBody.bits.writeBit(false);
        jettonTransferBody.bits.writeCoins(TonWeb.utils.toNano('0.02'));
        jettonTransferBody.bits.writeBit(true);
        jettonTransferBody.refs.push(forwardPayload);

        const jettonWallet = new TonWeb.token.ft.JettonWallet(tonweb.provider, {
            address: 'UQDlyGIved5xvnBXLxTeUs0ZN2q-2UafjwYVr9dHz5ElURpi'
        });

        const wallet = new tonweb.wallet.all['v4R2'](tonweb.provider, {
            publicKey: TonWeb.utils.hexToBytes('29dfa07266368c2fb74eb97169cc82d87fec609ee538c022bf580a344c2e6445'),
            wc: 0
        });

        const seqno = await wallet.methods.seqno().call();
        const address = await wallet.getAddress();

        const transfer = wallet.methods.transfer({
            secretKey: null, // We're not signing here
            toAddress: jettonWallet.address,
            amount: tonweb.utils.toNano('0.1'),
            seqno: seqno,
            payload: jettonTransferBody,
            sendMode: 3
        });

        const query = await transfer.getQuery();
        const boc = await query.toBoc(false);
        const unsignedMessageBase64 = TonWeb.utils.bytesToBase64(boc);

        return {
            unsignedMessageBase64,
            walletAddress: address,
            seqno
        };
    } catch (error) {
        console.error("Error in createUnsignedTransaction:", error);
        throw error;
    }
}
function createTonKeeperUrl(unsignedMessageBase64, toAddress, amount) {
    // Create a simplified request object for TonKeeper
    const request = {
        address: toAddress,
        amount: amount,
        payload: unsignedMessageBase64
    };

    // Convert the request object to a JSON string
    const requestJson = JSON.stringify(request);

    // Encode the JSON string to Base64
    const requestBase64 = Buffer.from(requestJson).toString('base64');

    // Create the TonKeeper URL
    const tonKeeperUrl = `https://app.tonkeeper.com/transfer/${requestBase64}`;

    return tonKeeperUrl;
}

async function main() {
    try {
        const { unsignedMessageBase64, walletAddress, seqno } = await createUnsignedTransaction();
        console.log('Unsigned Transaction (Base64):', unsignedMessageBase64);
        console.log('Wallet Address:', walletAddress.toString(true, true, true));
        console.log('Seqno:', seqno);

        const toAddress = "kQBiYlOgtCEy4exv1YKbTMx4kU80o8pWXR3X05-rsr8uQ27W"; // Destination address
        const amount = "100000000"; // 0.1 TON in nanotons
        const tonKeeperUrl = createTonKeeperUrl(unsignedMessageBase64, toAddress, amount);
        console.log('TonKeeper URL:', tonKeeperUrl);
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

main().finally(() => console.log("Exiting..."));