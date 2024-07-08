import { Address, beginCell, toNano } from '@ton/core';
import { JettonTon } from '../wrappers/JettonTon';
import { NetworkProvider } from '@ton/blueprint';


const CONTRACT_ADDRESS: string = "kQCnN6JQY5zMOIUM5QANqM1E9UJGsEKDZgaSfRWqWiMZkKXI";
const ADMIN_ADDRESS: string = "UQBo1BaEKOSxKOvI6Kl-M5jp8ijUOLNIDloamD5rD75ZEr2W";

export async function run(provider: NetworkProvider) {
    const Contract = provider.open(JettonTon.createFromAddress(Address.parse(CONTRACT_ADDRESS)));
    await Contract.sendMaintain(provider.sender(),
      Address.parse(ADMIN_ADDRESS)
    );
}
