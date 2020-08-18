import {errorType, logger, Utils} from "../utils";
import {Buffer} from "buffer";
import * as config from 'config';
import {Currency} from "../models/currency";
import {Address} from "../models/address";
import {Transaction} from "../models/transaction";


export class TransactionController {
    public static async get (transaction_id: number) {
        return Transaction.get(transaction_id);
    };
    public static async get_withdrawal (withdrawal_id: string) {
        return Transaction.get_withdrawal(withdrawal_id);
    };
    public static async create (data:any) {
        return Transaction.create(data);
    };
    public static async create_withdrawal (data:any) {
        let withdrawal = await TransactionController.get_withdrawal(data.withdrawal_id);
        if (withdrawal)
            throw {stack: errorType.WITHDRAWAL_EXISTED}
        return Transaction.create({...data, type: 1});
    };
}
