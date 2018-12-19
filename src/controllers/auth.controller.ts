import * as jwt from 'jsonwebtoken';
import * as httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/config';

import { Request, Response, NextFunction } from 'express';
import UserModel, { User } from '../models/user.model';

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

import * as uuid from 'uuid';

import * as speakeasy from 'speakeasy';

import MySMSClient from '../config/sms-client';

export let register = async (req: Request, res: Response, next: NextFunction) => {

    // todo: first, save nickname into db.

    return login(req, res, next);
};

/**
 * Returns jwt token if valid username and pord is provided
 */
export let login = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (!user) {
        const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
        return next(err);
    }

    const token = jwt.sign({
        username: req.body.phoneNo
    }, config.jwtSecret);

    return res.json({
        code: 0,
        message: 'OK',
        data: {
            token: token,
            username: req.body.phoneNo,
            nickname: user.nickname,
        }
    });
};

/**
 * send verification code via SMS for TF-Validation
 */
export let getVerificationCode = async (req, res, next) => {
    let user = await UserModel.findOne({ phoneNo: req.body.phoneNo });

    // create user when first time get SMS code.
    if (!user) {
        user = new UserModel({
            username: req.body.phoneNo,
            phoneNo: req.body.phoneNo,
            securityStamp: speakeasy.generateSecret().base32,
        });
        await user.save();
    }
    if (!user.securityStamp) {
        user.securityStamp = speakeasy.generateSecret().base32;
        await user.save();
    }

    const code = speakeasy.totp({
        secret: user.securityStamp.toString(),
        encoding: 'base32',
    });

    console.log(`Sending SMS to user: ${user.phoneNo}, code: ${code}`);

    const smsClient = new MySMSClient();
    smsClient.sendSMS({
        PhoneNumbers: req.body.phoneNo,
        SignName: config.aliCloud.smsSignName,
        TemplateCode: config.aliCloud.smsTemplateCode,
        TemplateParam: `{ "code": "${code}" }`
    }).then((result) => {
        const { Code } = result;
        if (Code === 'OK') {
            console.log(result);
        }
        return res.json({
            code: 0,
            message: 'OK',
        });
    }).catch((err) => {
        console.log(err);
        return res.json({
            code: 10001,
            message: 'Send SMS failed'
        });
    });
};

export default { login, getVerificationCode };
