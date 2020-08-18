import {Blockchain} from "./blockchain";
import {errorType, logger, Utils} from "../utils";
import {Buffer} from "buffer";
import * as config from 'config';

const axios = require('axios');
import {Currency} from "../models/currency";

export class BTC extends Blockchain{
    constructor(api: any) {
        super(api);
        logger.log(this.symbol + ' init');
    }

    async rpc_call (method:string, params:any[] = []) {
        try {
            let res = await axios({
                method: 'post',
                url: this.url,
                data: {
                    "jsonrpc": "1.0",
                    "id":"curltest",
                    "method": method,
                    "params": params
                },
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: {
                    username: this.hot_wallet_address,
                    password: this.hot_wallet_private_key
                },
            });
            if (res.data.error)
                throw res.data.error;
            // console.log(res);
            return res.data.result;
        } catch (e) {
            logger.error(e.stack);
            throw {stack: errorType.UNKNOWN_ERROR};
        }
    };

    async create_address () {
        let address = await this.rpc_call('getnewaddress');
        return {address: address};
    };
    async getTransactionReceipt (trans_id:string) {
        return this.rpc_call('getrawtransaction', [trans_id, true]);
    };
    async getBlockNumber () {
        return this.rpc_call('getblockcount');
    };
    async getHotWalletBalance (data:any = {}) {
        return this.rpc_call('getbalance');
    };
    async getBlockByHeight (block_height:number) {
        let block_hash = await this.rpc_call('getblockhash', [block_height]);
        return this.rpc_call('getblock', [block_hash]);
    };
    async send_many (data: any[]) {
        return this.rpc_call('sendmany', ["", data, 6, 'CONSERVATIVE']);
    };
}
