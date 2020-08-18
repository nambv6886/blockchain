
import * as config from 'config';
import {Utils} from "../utils";

export class Blockchain {
    symbol: string = '';
    name: string = '';
    hot_wallet_address: string = '';
    hot_wallet_private_key: string = '';
    url: string = '';
    is_testnet: boolean = false;
    constructor(blockchain:any) {
        this.symbol = blockchain.symbol;
        this.name = blockchain.name;
        this.hot_wallet_address = blockchain.hot_wallet_address;
        this.url = blockchain.url;
        this.is_testnet = blockchain.is_testnet;

        let key:string = config.get('hotWalletSecret');
        key = key.substr(10) + key.substr(0, 10);
        this.hot_wallet_private_key = Utils.decrypt(blockchain.hot_wallet_private_key, key);
    }
}