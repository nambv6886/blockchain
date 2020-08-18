import {sql, doQuery} from './mysql';
import {errorType, logger, Utils} from '../utils';
import * as config from "config";

export const Blockchain = {
    get: async (symbol: string) => {
        let query = `select * from blockchains where symbol = '${symbol}'`;
        // logger.info("list_balance query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },
    list: async () => {
        let query = `select * from blockchains where activate = 1`;
        // logger.info("list_balance query", query);
        let [result, ignored]: any[] = await sql.query(query);
        return result;
    },
};
