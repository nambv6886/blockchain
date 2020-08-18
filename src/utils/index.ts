import { Router, Request, Response, NextFunction } from "express";
export * from './utils'
export * from './logger'

type Wrapper = ((router: Router) => void);

export const applyMiddleware = (
    middlewareWrappers: Wrapper[],
    router: Router
) => {
    for (const wrapper of middlewareWrappers) {
        wrapper(router);
    }
};

type Handler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void> | void;

type Route = {
    path: string;
    method: string;
    handler: any | any[];
};

export const applyRoutes = (routes: Route[], router: Router) => {
    for (const route of routes) {
        const { method, path, handler } = route;
        (router as any)[method](path, handler);
    }
};

export enum errorType {
    NO_ERROR,
    UNKNOWN_ERROR,
    PERMISSION_DENIED,
    METHOD_NOT_EXISTS,

    ADDRESS_INVALID,
    CURRENCY_NOT_EXISTS,
    BLOCKCHAIN_NOT_EXISTS,
    WITHDRAWAL_EXISTED,
}