import {logger} from "../utils";
import * as express from 'express';
import * as config from 'config';
import { applyMiddleware, applyRoutes } from "../utils";
import middleware from "../middleware";
import routes from "../routes";
import error_handlers from "../middleware/error_handlers";
import {Blockchain} from "../models/blockchain";
import {ETH} from "../blockchain_services/eth";
import {TransactionService} from "../services/transaction_service";
import {BTC} from "../blockchain_services/btc";
import {WalletService} from "../services/wallet_service";

declare global {
    namespace NodeJS {
        interface Global {
            blockchain_list:any,
        }
    }
}
export default global;


const init_http_server = async (port: number = 80) => {
    const app = express();
    app.set("port", port);
    let http = require("http").Server(app);
    // let io = require("socket.io")(http);
    applyMiddleware(middleware, app);
    applyRoutes(routes, app);
    applyMiddleware(error_handlers, app);
    http.listen(port, function() {
        logger.info(`Server is running http://localhost:${port}...`)
    });
};

const init_blockchain = async () => {
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
    TransactionService.start_process().then();
    // WalletService.start_process().then();
};

logger.info('App Started!');
let port: number = 80;
if (config.has('port'))
    port = config.get('port');
init_http_server(port);
init_blockchain();

process.on("uncaughtException", e => {
    logger.error(e);
    process.exit(1);
});
process.on("unhandledRejection", e => {
    logger.error(e);
    process.exit(1);
});
