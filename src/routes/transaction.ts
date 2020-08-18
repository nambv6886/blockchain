import {BlockchainController, TransactionController} from "../controllers";
import {body, check, query} from "express-validator";
import {checkAuth, checkParams} from "../middleware/checks";
import {NextFunction, Request, Response} from "express";
import {logger} from "../utils";
import {serverError} from "../utils/error_handlers";

export default [
    {
        path: "/transaction/get_withdrawal",
        method: "post",
        handler: [
            body('withdrawal_id').isString(),
            checkParams,
            checkAuth,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    res.json({
                        result: 'ok',
                        data: await TransactionController.get_withdrawal(String(req.body.withdrawal_id))
                    });
                } catch (e) {
                    serverError(e, res, next);
                }
            }
        ]
    },
    {
        path: "/transaction/create_withdrawal",
        method: "post",
        handler: [
            body('withdrawal_id').isString(),
            body('currency_symbol').isString(),
            body('to_address').isString(),
            body('quantity').isNumeric(),
            checkParams,
            checkAuth,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    res.json({
                        result: 'ok',
                        data: await TransactionController.create_withdrawal({
                            withdrawal_id: req.body.withdrawal_id,
                            currency_symbol: req.body.currency_symbol,
                            to_address: req.body.to_address,
                            quantity: req.body.quantity,
                        })
                    });
                } catch (e) {
                    serverError(e, res, next);
                }
            }
        ]
    },
    {
        path: "/transaction/check_address",
        method: "post",
        handler: [
            body('address').isString(),
            body('symbol').isString(),
            checkParams,
            checkAuth,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    BlockchainController.check_address(req.body.symbol, req.body.address).then().catch();
                    res.json({result: 'ok'});
                } catch (e) {
                    serverError(e, res, next);
                }
            }
        ]
    },
];
