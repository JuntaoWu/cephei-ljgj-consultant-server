
import { Request, Response, NextFunction } from "express";
import { IncomingMessage } from 'http';
import * as jwt from 'jsonwebtoken';
import { InstanceType } from "typegoose";

import { config } from '../config/config';
import { APIError } from '../helpers/APIError';
import OrderModel, { Order, OrderStatus } from '../models/order.model';

import * as httpStatus from 'http-status';
import * as _ from 'lodash';
import OrderDiaryModel, { OrderDiaryType } from "../models/orderdiary.model";
import moment = require("moment");

// assign order to a default admin user.
export let assignOrder = async (req, res, next) => {

    if (!req.body.orderId) {
        const err = new APIError("orderId not provided", httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    let existingOrder = await OrderModel.findOne({ orderId: req.body.orderId });

    if (!existingOrder) {
        existingOrder = new OrderModel({
            orderId: req.body.orderId,
            assignee: config.assignee,
            orderStatus: OrderStatus.Initializing,
        });
        await confirmOrderBacklog(req.body.orderId);
    }
    else {
        existingOrder.assignee = config.assignee;
    }

    const savedOrder = await existingOrder.save();

    if (savedOrder) {
        return res.json({
            code: 0,
            message: "OK",
        });
    }
    else {
        return res.json({
            code: 500,
            error: true,
            message: `Unable to assign order ${req.body.orderId}`,
        });
    }
};

async function confirmOrderBacklog(orderId) {
    let orderDiaryId = `ORDER_DIARY_${_.random(10000, 99999)}_${moment().format(config.formats.idDateFormat)}`;

    let backlog = new OrderDiaryModel({
        orderDiaryId: orderDiaryId,
        orderId: orderId,
        orderDiaryTheme: "订单确认",
        orderDiaryType: OrderDiaryType.ConfirmOrder,
        orderDiaryContent: "客户平台下单, 客服已经确认订单信息",
        diaryPicUrls: []
    });

    await backlog.save();
}

