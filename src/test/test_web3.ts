// import Web3 from 'web3';
import * as config from 'config';

const Web3 = require('web3');
const abi = require('./ERC20ABI');
const abiDecoder = require('abi-decoder');
abiDecoder.addABI(abi);

const Tx = require('ethereumjs-tx');

declare global {
    namespace NodeJS {
        interface Global {
            io: any
        }
    }
}
export default global;


import {logger, Utils} from "../utils";
import {ETH} from "../blockchain_services/eth";
const address = '0x438446b5Fa7C4d51a0855eCA1799Dec3ba6120D8';
const privateKey = 'a';

(async () => {
    try {
        // generate a wallet
        // const web3 = new Web3('https://ropsten.infura.io/v3/3605fa44ae494ccbb14c20169749105a');
        // const result = web3.eth.accounts.create();
        // logger.log('resutl:', result);

        let key:string = config.get('hotWalletSecret');
        key = key.substr(10) + key.substr(0, 10);
        let encrypt = Utils.encrypt(privateKey, key);
        logger.log('encrypt: ',encrypt);
        let decrypt = Utils.decrypt(encrypt, key);
        logger.log('decrypt:',decrypt);

    }
    catch (e) {
        logger.error(e);
    }
})();