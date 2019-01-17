

import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import * as httpStatus from 'http-status';

import config from '../config/config';
import APIError from '../helpers/APIError';

export let post = async (req: Request, res: Response, next: NextFunction) => {

    

    return res.json({
        code: 0,
        message: 'OK',
        data: ""
    });
};

export default { post };