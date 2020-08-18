import {BlockchainController} from "../controllers";
import {body, check, query} from "express-validator";
import {checkAuth, checkParams} from "../middleware/checks";
import {NextFunction, Request, Response} from "express";
import {logger} from "../utils";
import {serverError} from "../utils/error_handlers";

export default [
    {
        path: "/blockchain/get_address",
        method: "post",
        handler: [
            body('user_id').isNumeric(),
            body('symbol').isString(),
            checkParams,
            checkAuth,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    res.json({
                        result: 'ok',
                        data: await BlockchainController.get_address(Number(req.body.user_id), String(req.body.symbol))
                    });
                } catch (e) {
                    serverError(e, res, next);
                }
            }
        ]
    },
    {
        path: "/blockchain/getBalance",
        method: "post",
        handler: [
            body('symbol').isString(),
            body('address').isString(),
            checkParams,
            checkAuth,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    res.json({
                        result: 'ok',
                        data: await BlockchainController.getBalance(String(req.body.symbol), String(req.body.address))
                    });
                } catch (e) {
                    serverError(e, res, next);
                }
            }
        ]
    },
    {
        path: "/blockchain/getHotWalletBalance",
        method: "post",
        handler: [
            body('symbols').isArray(),
            checkParams,
            checkAuth,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    res.json({
                        result: 'ok',
                        data: await BlockchainController.getHotWalletBalance(req.body.symbols)
                    });
                } catch (e) {
                    serverError(e, res, next);
                }
            }
        ]
    },
    {
        path: "/blockchain/getTransactionReceipt",
        method: "post",
        handler: [
            body('symbol').isString(),
            body('transaction_hash').isString(),
            checkParams,
            checkAuth,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    res.json({
                        result: 'ok',
                        data: await BlockchainController.getTransactionReceipt(String(req.body.symbol), String(req.body.transaction_hash))
                    });
                } catch (e) {
                    serverError(e, res, next);
                }
            }
        ]
    },
    {
        path: "/blockchain/getBlockNumber",
        method: "post",
        handler: [
            body('symbol').isString(),
            checkParams,
            checkAuth,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    res.json({
                        result: 'ok',
                        data: await BlockchainController.getBlockNumber(String(req.body.symbol))
                    });
                } catch (e) {
                    serverError(e, res, next);
                }
            }
        ]
    },
    {
        path: "/blockchain/getBlockByHeight",
        method: "post",
        handler: [
            body('symbol').isString(),
            body('block_height').isInt({min: 1}),
            checkParams,
            checkAuth,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    res.json({
                        result: 'ok',
                        data: await BlockchainController.getBlockByHeight(String(req.body.symbol), Number(req.body.block_height))
                    });
                } catch (e) {
                    serverError(e, res, next);
                }
            }
        ]
    },
];
