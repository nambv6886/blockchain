import {errorType, logger, Utils} from "../utils";
import {Buffer} from "buffer";
import * as config from 'config';
import {Currency} from "../models/currency";
import {Address} from "../models/address";
import {Transaction} from "../models/transaction";

const get_blockchain = async (symbol: string) => {
    let currency = await Currency.get(symbol);
    if (!currency || !currency.activate)
        throw {stack: errorType.CURRENCY_NOT_EXISTS};

    let blockchain = global.blockchain_list[currency.blockchain_symbol];
    if (!blockchain)
        throw {stack: errorType.BLOCKCHAIN_NOT_EXISTS};
    return blockchain;
}

export class BlockchainController {
    public static async get_address (user_id: number, symbol: string) {
        let blockchain = await get_blockchain(symbol);
        let wallet = await blockchain.create_address();
        if (symbol != 'BTC' && symbol != 'TBTC') {
            let encrypt_pass = user_id + String(config.get('addressSecret'));
            await Address.create({
                symbol: blockchain.symbol,
                user_id: user_id,
                address: wallet.address.toLowerCase(),
                private_key: Utils.encrypt(wallet.privateKey, encrypt_pass),
            })
        }
        return wallet.address;
    };
    public static async getTransactionReceipt (symbol: string, transaction_hash:string) {
        let blockchain = await get_blockchain(symbol);
        return blockchain.getTransactionReceipt(transaction_hash);
    };
    public static async getBlockNumber (symbol: string) {
        let blockchain = await get_blockchain(symbol);
        return blockchain.getBlockNumber();
    };
    public static async getBalance (symbol: string, address: string) {
        if (['BTC', 'TBTC'].includes(symbol.toUpperCase()))
            throw {stack: errorType.METHOD_NOT_EXISTS};
        let blockchain = await get_blockchain(symbol);
        return blockchain.getBalance(symbol, address);
    };
    public static async getHotWalletBalance (symbols:string[]) {
        let balances:any[] = [];
        await Promise.all(symbols.map(async (symbol: any) => {
            try {
                let blockchain = await get_blockchain(symbol);
                let balance = await blockchain.getHotWalletBalance({symbol});
                balances.push({symbol, balance});
            } catch (e) {
                logger.error('get hot wallet balance failed', symbol, e);
            }
        }));
        return balances;
    };
    public static async getBlockByHeight (symbol: string, block_height:number) {
        let blockchain = await get_blockchain(symbol);
        return blockchain.getBlockByHeight(block_height, true);
    };
    public static async transfer_from_hot (symbol: string, to_address: string, quantity: number, index: number = 0) {
        if (['BTC', 'TBTC'].includes(symbol.toUpperCase()))
            throw {stack: errorType.METHOD_NOT_EXISTS};
        let blockchain = await get_blockchain(symbol);
        return blockchain.transfer_from_hot(symbol, to_address, quantity, index);
    };
    public static async transfer_to_hot (symbol: string, from_address: string, quantity: number, index: number = 0) {
        if (['BTC', 'TBTC'].includes(symbol.toUpperCase()))
            throw {stack: errorType.METHOD_NOT_EXISTS};
        let blockchain = await get_blockchain(symbol);
        return blockchain.transfer_to_hot(symbol, from_address, quantity, index);
    };
    public static async btc_transfer (symbol: string, data:any) {
        if (!['BTC', 'TBTC'].includes(symbol.toUpperCase()))
            throw {stack: errorType.METHOD_NOT_EXISTS};
        let blockchain = await get_blockchain(symbol);
        return blockchain.send_many(data);
    };
    public static async getGasPrice (symbol: string) {
        if (!['ETH', 'RETH'].includes(symbol.toUpperCase()))
            throw {stack: errorType.METHOD_NOT_EXISTS};
        let blockchain = await get_blockchain(symbol);
        return blockchain.getGasPrice();
    };
    public static async check_address (symbol: string, address:string) {
        if (!['ETH', 'RETH'].includes(symbol.toUpperCase()))
            throw {stack: errorType.METHOD_NOT_EXISTS};
        let blockchain = await get_blockchain(symbol);
        return blockchain.check_address(address);
    };
}
