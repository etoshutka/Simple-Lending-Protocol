import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export type JettonTonConfig = {
    borrowerAddress: Address
    adminAddress: Address
};

export function jettonTonConfigToCell(config: JettonTonConfig): Cell {
    return beginCell()
                    .storeAddress(config.borrowerAddress)
                    .storeAddress(config.adminAddress)
            .endCell();
}

export class JettonTon implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new JettonTon(address);
    }

    static createFromConfig(config: JettonTonConfig, code: Cell, workchain = 0) {
        const data = jettonTonConfigToCell(config);
        const init = { code, data };
        return new JettonTon(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTokens(provider: ContractProvider, via: Sender, value: bigint, jettonWallet: Address, borrowerAddress : Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).storeAddress(jettonWallet).storeAddress(borrowerAddress).endCell(),
        });
    }

    async sendTokensReceive(provider: ContractProvider, via: Sender, value: bigint, jettonWallet: Address, borrowerAddress : Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x7362d09c, 32).storeAddress(jettonWallet).storeAddress(borrowerAddress).endCell(),
        });
    }
    async sendTransfer(provider: ContractProvider, via: Sender,
        opts: {
            value: bigint;
            toAddress: Address;
            queryId: number;
            fwdAmount: bigint;
            jettonAmount: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x178d4519, 32)
                .storeUint(opts.queryId, 64)
                .storeCoins(opts.jettonAmount)
                .storeAddress(opts.toAddress)
                .storeAddress(via.address)
                .storeUint(0, 1)
                .storeCoins(opts.fwdAmount)
                .storeUint(0, 1)
            .endCell(),
        });
    }
    async sendTransfer1(
        provider: ContractProvider,
        via: Sender,
        opts: {
            toAddress: Address;
            amount: number;
            responseAddress: Address;
            forwardAmount: bigint;
        }
    ) {
        const messageBody = beginCell()
            .storeUint(3, 32) // op::transfer_notification
            .storeUint(0, 64) // query_id
            .storeCoins(opts.amount)
            .storeAddress(opts.toAddress)
            .storeAddress(opts.responseAddress)
            .storeBit(0) // null custom_payload
            .storeCoins(opts.forwardAmount)
            .storeBit(0) // forward_payload in this slice, not separate cell
            .endCell();

        await provider.internal(via, {
            value: toNano('0.05'), // Attach some TON for gas
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: messageBody,
        });
    }


    async sendMaintain(provider:ContractProvider, via:Sender, address: Address) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            value: toNano("0.1"),
            body: 
                beginCell()
                    .storeUint(2, 32)
                    .storeUint(128, 8)
                    .storeRef(
                        beginCell()
                            .storeUint(0x18, 6)
                            .storeAddress(address)
                            .storeCoins(0)
                            .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
                        .endCell()
                    )
                .endCell()
        });
    } 


    // GET METHODS

    async getContractBalance(provider: ContractProvider) {
        const { stack } = await provider.get('get_contract_balance', []);

        return {
            contract_balance: stack.readBigNumber(),
        };
    }

    async getLastBorrower(provider: ContractProvider) {
        const result = await provider.get('get_last_borrower', []);
    
        let data: [Address,bigint,bigint]
        data = [
        result.stack.readAddress(),
        result.stack.readBigNumber(),
        result.stack.readBigNumber(),
        ]
    
        return data;
    }

}
