import * as config from "config";
import {Address} from "../models/address";
import {logger, Utils} from "../utils";
import {BlockchainController} from "../controllers";
import {Blockchain} from "../models/blockchain";
import {Transaction} from "../models/transaction";
import {Currency} from "../models/currency";
import {ETH} from "../blockchain_services/eth";
import {BTC} from "../blockchain_services/btc";

const sleep = require('util').promisify(setTimeout)

declare global {
    namespace NodeJS {
        interface Global {
            blockchain_list:any,
        }
    }
}
export default global;

export class WalletService {
    public static async start_process() {
        try {
            let blockchains_list = await Blockchain.list();
            for (let blockchain of blockchains_list) {
                if (['RETH', 'ETH'].includes(blockchain.symbol)) {
                    let list_address = await Address.list(blockchain.symbol);
                    logger.info('list address', blockchain.symbol, list_address.length)
                    for (let [index, address] of list_address.entries()) {
                        // logger.log('check address', list_address.length, i, address.address);
                        await BlockchainController.check_address(blockchain.symbol, address.address);
                    }

                }
            }
        } catch (e) {
            logger.error(e);
        } finally {
            // setTimeout(WalletService.start_process, 7200000);
        }
    };
}

(async () => {
    logger.info('init blockchain!');
    global.blockchain_list = {};
    let list = await Blockchain.list();
    logger.log(list);
    for (let blockchain of list) {
        if (blockchain.symbol == 'ETH' || blockchain.symbol == 'RETH') {
            global.blockchain_list[blockchain.symbol] = new ETH(blockchain);
        }
        else if (blockchain.symbol == 'BTC' || blockchain.symbol == 'TBTC') {
            global.blockchain_list[blockchain.symbol] = new BTC(blockchain);
        }
    }
    WalletService.start_process().then();
})();