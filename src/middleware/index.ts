import {
    handleCors,
    handleBodyRequestParsing,
    handleCompression,
    handleHelmet
} from "./common";

export default [handleCors, handleHelmet, handleBodyRequestParsing, handleCompression];
