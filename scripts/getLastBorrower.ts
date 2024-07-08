import { Address} from '@ton/core';
import { JettonTon } from '../wrappers/JettonTon';
import { NetworkProvider } from '@ton/blueprint';

const CONTRACT_ADDRESS: string = "EQBnYIGFS5pR-trfSYTtLEi-6vCQSp8Fx7PVwul_mT4aFi5Z";


export async function run(provider: NetworkProvider) {
    const Contract = provider.open(JettonTon.createFromAddress(Address.parse(CONTRACT_ADDRESS)));
    const result = await Contract.getLastBorrower();

    console.log("address:", result[0]);
    console.log("tokens value:", result[1]);
    console.log("ton value:", result[2]);
}
