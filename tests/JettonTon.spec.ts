import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { JettonTon } from '../wrappers/JettonTon';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('JettonTon', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('JettonTon');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let jettonTon: SandboxContract<JettonTon>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        jettonTon = blockchain.openContract(JettonTon.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await jettonTon.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonTon.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and jettonTon are ready to use
    });
});
