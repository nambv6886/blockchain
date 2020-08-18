import {sql, doQuery} from './mysql';
import {errorType, logger, Utils} from '../utils';
import * as config from "config";

export const Address = {
    get: async (address: string) => {
        let query = `select * from addresses where address = '${address}'`;
        // logger.info("list_balance query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },
    list: async (symbol: string) => {
        let query = `select * from addresses where symbol = '${symbol}'`;
        // logger.info("list_balance query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result;
    },
    get_private_key: async (address: string) => {
        let address_obj = await Address.get(address);
        let decrypt_pass = address_obj.user_id + String(config.get('addressSecret'));
        return Utils.decrypt(address_obj.private_key, decrypt_pass);
    },
    create: async (data: any) => {
        let item: any = {
            symbol: data.symbol,
            user_id: data.user_id,
            address: data.address,
            private_key: data.private_key,
        };
        return doQuery.insertRow('addresses', item);
    },
};
