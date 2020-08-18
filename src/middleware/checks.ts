import {Request, Response, NextFunction} from "express";
import {HTTP400Error} from "../utils/http_errors";
import {validationResult} from "express-validator";
import * as jwt from "jsonwebtoken";
import * as config from 'config';

import { Utils, logger } from "../utils";
import { sql } from '../models/mysql';
import { ApiKey } from "../models/api_keys";

export const checkParams = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            result: 'not ok',
            error_message: `${errors.array()[0].msg}: ${errors.array()[0].param}`,
        });
    }
    next();
};

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    // make check auth
    //Call the next middleware or controller

    let { token, publickey, nonce } = req.headers;
    const body = JSON.stringify(req.body);

    if(Utils.IsNullOrUndefined(token) || Utils.IsNullOrUndefined(publickey) || Utils.IsNullOrUndefined(nonce)) {
        res.status(401).send();
        return;
    }

    publickey = <string>publickey;
    const result = await ApiKey.get(publickey);
    if (!result) {
        res.status(401).send();
        return;
    }
    // create hash from private key, body, and nonce
    const payload = `${result.private_key}-${body}-${nonce}`;
    const hash = await Utils.sha256(payload);

    if(token !== hash) {
        res.status(401).send();
        return;
    }

    next();
};
