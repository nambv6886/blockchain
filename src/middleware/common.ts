
import { Router } from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as helmet from "helmet";

export const handleCors = (router: Router) =>
    router.use(cors({ credentials: true, origin: true }));

export const handleHelmet = (router: Router) => {
    router.use(helmet());
};

export const handleBodyRequestParsing = (router: Router) => {
    router.use(bodyParser.urlencoded({ extended: true }));
    router.use(bodyParser.json());
};

export const handleCompression = (router: Router) => {
    router.use(compression());
};
