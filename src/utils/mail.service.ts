import * as nodemailer from 'nodemailer';
import {callbackify} from "util";
import {SentMessageInfo} from "nodemailer";

export class MailService {

    private _transporter: nodemailer.Transporter;

    /**
     *
     */
    constructor() {
        this._transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'tqlong.net@gmail.com',
                pass: 'eptdyufdgzuplxiv'
            }
        });
    }

    /***
     *
     * @param to
     * @param subject
     * @param content
     */
    sendMail(to: string, subject: string, content: string, callback:(err: any, message: any) => void) {

        let mailOptions = {
            from: 'anb',
            to: to,
            subject: subject,
            html: content
        };

        this._transporter.sendMail(mailOptions, function (_error, _info) {
            if(_error){
                callback(_error, null);
            } else {
                callback(null, _info);
            }
        })
    }
}
