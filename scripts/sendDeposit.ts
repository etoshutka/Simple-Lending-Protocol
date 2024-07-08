import { Address, TupleItemSlice, beginCell, toNano } from '@ton/core';
import { JettonTon } from '../wrappers/JettonTon';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { TonClient } from '@ton/ton';


const CONTRACT_ADDRESS: string = "kQDie05EOA7nlSEyvgR3NXGSp86tdEKYrl2rsFq0Q3kgHBJc";
const JETTON_MINTER_ADDRESS: string = "kQA25YwnFEi0h-i5e0x8rid4z7IS_c0gpR9AIvzcpKX8qVlc";

const BORROWER_ADDRESS: string = 'UQDlyGIved5xvnBXLxTeUs0ZN2q-2UafjwYVr9dHz5ElURpi';

export async function calculateJettonWalletAddress(minterAddress: string, ownerAddress: Address): Promise<string> {

    const client = new TonClient({
        endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    });
    
    await sleep(1500);
    const response = await client.runMethod(Address.parse(minterAddress), "get_wallet_address", [
        {
            type: 'slice',
            cell: 
                beginCell()
                    .storeAddress(ownerAddress)
                .endCell()
        } as TupleItemSlice
    ])
    return response.stack.readAddress().toString();
}

export async function run(provider: NetworkProvider) {
    const jettonWalletAddress = await calculateJettonWalletAddress(JETTON_MINTER_ADDRESS, Address.parse(CONTRACT_ADDRESS))
    const Contract = provider.open(JettonTon.createFromAddress(Address.parse(CONTRACT_ADDRESS)));
    await Contract.sendTokens(provider.sender(),
      toNano('1'),
      Address.parse(jettonWalletAddress),
      Address.parse(BORROWER_ADDRESS)
    );
}
