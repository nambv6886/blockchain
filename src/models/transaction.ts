import {sql, doQuery} from './mysql';
import {errorType, logger, Utils} from '../utils';
import * as config from "config";
import transaction from "ethereumjs-tx/dist/transaction";

export const Transaction = {
    get: async (transaction_id: number) => {
        let query = `select * from transactions where transaction_id = ${transaction_id}`;
        // logger.info("list_balance query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },
    get_withdrawal: async (withdrawal_id: string) => {
        let query = `select * from transactions where type = 1 and withdrawal_id = '${withdrawal_id}'`;
        // logger.info("list_balance query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },
    list_transaction_to_send: async (blockchain_symbol:string) => {
        let query = `select a.id, a.currency_symbol, b.blockchain_symbol, a.quantity, a.to_address, a.type, a.withdrawal_id, a.transaction_hash, a.status 
                    from transactions a
                    inner join currencies b
                    on a.currency_symbol = b.symbol and 
                    b.blockchain_symbol = '${blockchain_symbol}' and status = 0 limit 5;`;
        // logger.info("list_balance query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result;
    },
    create: async (data: any) => {
        let item: any = {
            currency_symbol: data.currency_symbol,
            to_address: data.to_address,
            quantity: data.quantity,
            type: data.type
        };
        if (data.from_address)
            item.from_address = data.from_address;
        if (data.withdrawal_id)
            item.withdrawal_id = data.withdrawal_id;
        if (data.transaction_hash)
            item.transaction_hash = data.transaction_hash;
        return doQuery.insertRow('transactions', item);
    },
    transfer_processing: async (transaction_id: number) => {
        let obj:any = {
            status: 1,
        };
        await doQuery.updateRow('transactions', obj, transaction_id);
    },
    transfer_succeeded: async (transaction_id: number, transaction_hash:string) => {
        let obj:any = {
            status: 2,
            transaction_hash: transaction_hash,
        };
        await doQuery.updateRow('transactions', obj, transaction_id);
    },
    transfer_failed: async (transaction_id: number, error_message:string) => {
        let obj:any = {
            status: 3,
            message: error_message,
        };
        await doQuery.updateRow('transactions', obj, transaction_id);
    }
};
