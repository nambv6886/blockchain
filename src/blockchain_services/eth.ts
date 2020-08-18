import {Blockchain} from "./blockchain";
import {errorType, logger, Utils} from "../utils";
import {Buffer} from "buffer";
import * as config from 'config';

const axios = require('axios');
import {Address} from "../models/address";
import {Currency} from "../models/currency";
import {BlockchainController} from "../controllers";
import {Transaction} from "../models/transaction";

const Web3 = require('web3');
const abi = require('./ERC20ABI');
const abiDecoder = require('abi-decoder');
abiDecoder.addABI(abi);

const Tx = require('ethereumjs-tx').Transaction;


export class ETH extends Blockchain {
    web3: any;
    gas_price: number = 0;
    gas_price_time: number = 0;

    constructor(api: any) {
        super(api);
        this.web3 = new Web3(this.url);
        logger.log(this.symbol + ' init');
    }

    async create_address() {
        let createdAccount = this.web3.eth.accounts.create();
        let address = createdAccount.address.toLowerCase();
        let privateKey = createdAccount.privateKey;
        return {address, privateKey};
    };

    async getTransactionReceipt(trans_id: string) {
        return this.web3.eth.getTransactionReceipt(trans_id);
    };

    async getBlockNumber() {
        return this.web3.eth.getBlockNumber();
    };

    async getBlockByHeight(block_height: number) {
        return this.web3.eth.getBlock(block_height, true);
    };

    async getBalance(symbol: string, address: string) {
        let currency = await Currency.get(symbol);
        if (!currency)
            throw {stack: errorType.CURRENCY_NOT_EXISTS}

        if (symbol.toUpperCase() == 'ETH' || symbol.toUpperCase() == 'RETH') {
            let balance = await this.web3.eth.getBalance(address);
            return Number(this.web3.utils.fromWei(String(balance), 'ether'));
        } else {
            const contract = new this.web3.eth.Contract(abi, currency.token_address, {from: address});
            let balance = await contract.methods.balanceOf(address).call();

            const unitMapping = {
                "0": "noether",
                "1": "wei",
                "3": "kwei",
                "6": "mwei",
                "9": "gwei",
                "12": "microether",
                "15:": "milliether",
                "18": "ether",
                "21": "kether",
                "24": "mether",
                "27": "tether",
            };
            let add_digit = currency.decimal % 3;
            let digit = currency.decimal - add_digit;
            // @ts-ignore
            return Number(this.web3.utils.fromWei(String(balance), unitMapping[digit])) * (10 ** add_digit);
        }
    };

    async getHotWalletBalance(data: any) {
        return this.getBalance(data.symbol, this.hot_wallet_address);
    };

    async getGasPrice() {
        try {
            if (this.gas_price_time + 10 * 60 * 1000 < Date.now()) {
                let gas_url:string = config.get('gas_price_url');
                let res = await axios.get(gas_url, {timeout: 10000});
                this.gas_price = Math.min(res.data.fastest / 10, 100);
                this.gas_price_time = Date.now();
            }
        } catch (e) {
            logger.error(e);
        }
        return this.gas_price || 30;
    };

    async decodeInput(input: string) {
        return abiDecoder.decodeMethod(input);
    };

    async transfer(symbol: string, from_address: string, to_address: string, quantity: number, index: number = 0) {

        let currency = await Currency.get(symbol);
        if (!currency)
            throw {stack: errorType.CURRENCY_NOT_EXISTS}
        // get private key
        let private_key: string;
        if (from_address.toLowerCase() == this.hot_wallet_address.toLowerCase()) {
            private_key = this.hot_wallet_private_key;
        } else {
            private_key = await Address.get_private_key(from_address);
        }

        if (!private_key)
            throw {stack: errorType.ADDRESS_INVALID}

        let count = await this.web3.eth.getTransactionCount(from_address);
        let gasPrice = await this.getGasPrice();

        let rawTransaction: any = {
            "from": from_address,
            "gasPrice": this.web3.utils.toHex(this.web3.utils.toWei(String(gasPrice), 'gwei')),
            "nonce": this.web3.utils.toHex(count + index)
        };


        if (symbol.toUpperCase() == 'ETH' || symbol.toUpperCase() == 'RETH') {
            rawTransaction.gasLimit = this.web3.utils.toHex('21000');
            rawTransaction.to = to_address;
            rawTransaction.value = this.web3.utils.toHex(this.web3.utils.toWei(String(quantity), 'ether'));
        } else {
            const contract = new this.web3.eth.Contract(abi, currency.token_address, {from: from_address});
            rawTransaction.gasLimit = this.web3.utils.toHex('60000');
            rawTransaction.value = "0x0";
            rawTransaction.data = contract.methods.transfer(to_address, this.web3.utils.toWei(String(quantity), 'ether')).encodeABI();
            rawTransaction.to = currency.token_address;
        }
        logger.log(rawTransaction);

        let opts = {};
        if (this.is_testnet)
            opts = {'chain': 'ropsten'};

        const transaction = new Tx(rawTransaction, opts);

        let privateKey = Buffer.from(private_key.length == 66 ? private_key.substr(2) : private_key, 'hex');
        transaction.sign(privateKey);

        return this.web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'));
    };

    async transfer_from_hot(symbol: string, to_address: string, quantity: number, index: number = 0) {
        return this.transfer(symbol, this.hot_wallet_address, to_address, quantity, index);
    };

    async transfer_to_hot(symbol: string, from_address: string, quantity: number, index: number = 0) {
        return this.transfer(symbol, from_address, this.hot_wallet_address, quantity, index);
    };

    async check_address(address: string) {
        // send to hot
        let currencies_list = await Currency.list()
        for (let currency of currencies_list.filter((x: any) => x.blockchain_symbol == this.symbol && x.is_token)) {
            let balance = await this.getBalance(currency.symbol, address)
            logger.log(currency.symbol, address, balance);
            if (balance >= currency.minimum_threshold) {
                // check balance ETH
                let eth_balance = await this.getBalance(currency.blockchain_symbol, address)
                let gas_price = await this.getGasPrice();
                if (eth_balance < (gas_price * 60 / 1000000) + 0.0001) {
                    // send eth to address
                    let obj = {
                        currency_symbol: currency.blockchain_symbol,
                        to_address: address,
                        quantity: Utils.normalizeNumber((gas_price * 60 / 1000000) + 0.001 - eth_balance),
                        type: 2
                    }
                    logger.info('create transaction', obj);
                    await Transaction.create(obj)
                } else {
                    // send to hot
                    logger.trace('transfer_to_hot', currency.symbol, address, balance);
                    let trans = await this.transfer_to_hot(currency.symbol, address, balance - 0.0001);
                    logger.trace('transfer_to_hot succeeded', trans);
                }
            }
        }

        let currency = currencies_list.find((x: any) => x.blockchain_symbol == this.symbol && !x.is_token);
        if (currency) {
            let balance = await this.getBalance(currency.symbol, address)
            logger.log(currency.symbol, address, balance);
            if (balance >= currency.minimum_threshold) {
                // send to hot
                let gas_price = await this.getGasPrice();
                let fee = (gas_price * 21 / 1000000) + 0.0001

                logger.trace('transfer_to_hot', currency.symbol, address, balance -fee);
                let trans = await BlockchainController.transfer_to_hot(currency.symbol, address, balance - fee);
                logger.trace('transfer_to_hot succeeded', trans);
            }
        }
    }
}
