

import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import * as httpStatus from 'http-status';

import config from '../config/config';
import APIError from '../helpers/APIError';

export let post = async (req: Request, res: Response, next: NextFunction) => {

    console.log("Received file:", req.file.originalname, req.file.filename);

    return res.json({
        code: 0,
        message: 'OK',
        data: {
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path
        }
    });
};

export default { post };