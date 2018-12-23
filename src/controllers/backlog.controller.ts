
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import * as httpStatus from 'http-status';

import config from '../config/config';
import APIError from '../helpers/APIError';

import OrderModel, { OrderStatus } from '../models/order.model';
import BacklogModel from '../models/backlog.model';

export let load = async (req: Request, res: Response, next: NextFunction) => {

    const { orderId } = req.params;

    const order = await OrderModel.findOne({ orderId: orderId, assignee: req.user.phoneNo });

    if (!order) {
        const err = new APIError("Order not found.", httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let backlogs = await BacklogModel.find({ orderId: orderId }).sort({ backlogType: 1 });

    return res.json({
        code: 0,
        message: 'OK',
        data: backlogs || []
    });
};

export default { load };