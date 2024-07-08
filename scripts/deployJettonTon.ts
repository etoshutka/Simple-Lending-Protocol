import { Address, toNano } from '@ton/core';
import { JettonTon } from '../wrappers/JettonTon';
import { compile, NetworkProvider } from '@ton/blueprint';


const BORROWER_ADDRESS: string = 'UQDlyGIved5xvnBXLxTeUs0ZN2q-2UafjwYVr9dHz5ElURpi';

export async function run(provider: NetworkProvider) {
    const jettonTon = provider.open(JettonTon.createFromConfig({
        borrowerAddress: Address.parse(BORROWER_ADDRESS),
        adminAddress: provider.sender().address as Address
    }, await compile('JettonTon')));

    await jettonTon.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(jettonTon.address);

    // run methods on `jettonTon`
}
