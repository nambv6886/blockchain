import { Response, NextFunction } from "express";
import { HTTPClientError, HTTP404Error } from "./http_errors";
import {errorType, logger} from "../utils";

export const notFoundError = () => {
    throw new HTTP404Error("Method not found.");
};

export const clientError = (err: Error, res: Response, next: NextFunction) => {
    if (err instanceof HTTPClientError) {
        console.warn(err);
        res.status(err.statusCode).send(err.message);
    } else {
        next(err);
    }
};

export const serverError = (err: Error, res: Response, next: NextFunction) => {
    logger.error(err);
    // if (process.env.NODE_ENV === "production") {
    //     res.status(500).send("Internal Server Error");
    // } else {
    res.status(500).send({result: 'not ok', error_code: err.stack, error_message: errorType[Number(err.stack)]});
    // }
};
