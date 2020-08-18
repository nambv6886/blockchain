import * as config from "config";
import {Address} from "../models/address";
import {logger, Utils} from "../utils";
import {BlockchainController} from "../controllers";
import {Blockchain} from "../models/blockchain";
import {Transaction} from "../models/transaction";
import {Currency} from "../models/currency";

export class TransactionService {
    public static async start_process() {
        try {
            let blockchain_list = await Blockchain.list();
            for (let blockchain of blockchain_list) {
                let transaction_list = await Transaction.list_transaction_to_send(blockchain.symbol);
                if (transaction_list.length) {
                    if (blockchain.symbol == 'ETH' || blockchain.symbol == 'RETH') {
                        await Promise.all(transaction_list.map(async (transaction: any, index: number) => {
                            try {
                                logger.info('have send transaction', transaction);
                                await Transaction.transfer_processing(transaction.id);
                                let trans = await BlockchainController.transfer_from_hot(transaction.currency_symbol, transaction.to_address, transaction.quantity, index);
                                logger.trace('withdraw success', transaction, trans);
                                await Transaction.transfer_succeeded(transaction.id, trans.transactionHash);

                                if (transaction.type == 2) {
                                    // wait 2 min
                                    setTimeout(async () => {
                                        BlockchainController.check_address(blockchain.symbol, transaction.to_address)
                                            .catch((e) => logger.error(e));
                                    }, 120000);
                                }
                            } catch (e) {
                                logger.error('send transaction failed', transaction, e);
                                await Transaction.transfer_failed(transaction.id, e.message);
                                // await Transaction.update_status(transaction.id, 3, e.stack);
                            }
                        }));
                    } else if (blockchain.symbol == 'BTC' || blockchain.symbol == 'TBTC') {
                        let send_data: any = {};
                        for (let transaction of transaction_list) {
                            await Transaction.transfer_processing(transaction.id);
                            send_data[transaction.to_address] = Utils.normalizeNumber(transaction.quantity);
                        }
                        try {
                            let trans_hash = await BlockchainController.btc_transfer(blockchain.symbol, send_data);
                            try {
                                for (let transaction of transaction_list) {
                                    await Transaction.transfer_succeeded(transaction.id, trans_hash);
                                }
                            } catch (e) {
                                logger.error(e)
                            }
                        } catch (e) {
                            for (let transaction of transaction_list) {
                                await Transaction.transfer_failed(transaction.id, e.message);
                            }
                        }

                    }
                }
            }
        } catch (e) {
            logger.error(e);
        } finally {
            setTimeout(TransactionService.start_process, 30000);
        }
    };
}
