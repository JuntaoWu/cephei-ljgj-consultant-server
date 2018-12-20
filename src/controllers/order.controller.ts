
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import config from '../config/config';
import OrderModel, { OrderStatus } from '../models/order.model';
import orderContractModel, { OrderContract } from '../models/ordercontract.model';
import APIError from '../helpers/APIError';

import * as httpStatus from 'http-status';

export let list = async (req: Request, res: Response, next: NextFunction) => {
    const { status = OrderStatus.All, skip = 0, limit = 10 } = req.query;

    let condition: any = { assignee: req.user.phoneNo };
    if (+status) {
        condition.orderStatus = +status;
    }

    let totalItems = await OrderModel.count(condition);
    let orders = await OrderModel.find(condition).skip(+skip).limit(+limit);
    const orderIds = orders.map(i => i.orderId.toString());

    let fetchedOrders = await getOrdersViaPublicServiceAsync(orderIds);

    return res.json({
        code: 0,
        message: 'OK',
        data: {
            totalItems: totalItems,
            items: fetchedOrders
        }
    });
};

export let getAllOrderList = async (req, res, next) => {

    // 查询全部的订单
    let orders = await OrderModel.find({ assignee: req.user.phoneNo });
    const orderIds = orders.map(i => i.orderId.toString());

    let fetchedOrders = await getOrdersViaPublicServiceAsync(orderIds);

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrders
    });
};

export let getInitOrderList = async (req, res, next) => {

    // 查询审核中/初始化中的订单
    let orders = await OrderModel.find({ assignee: req.user.phoneNo, orderStatus: OrderStatus.Initializing });
    const orderIds = orders.map(i => i.orderId.toString());

    let fetchedOrders = await getOrdersViaPublicServiceAsync(orderIds);

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrders
    });
};

export let getPreparingOrderList = async (req, res, next) => {

    // 查询准备中的订单
    let orders = await OrderModel.find({ assignee: req.user.phoneNo, orderStatus: OrderStatus.Preparing });
    const orderIds = orders.map(i => i.orderId.toString());

    let fetchedOrders = await getOrdersViaPublicServiceAsync(orderIds);

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrders
    });
};

export let getInProgressOrderList = async (req, res, next) => {

    // 查询施工中中的订单
    let orders = await OrderModel.find({ assignee: req.user.phoneNo, orderStatus: OrderStatus.InProgress });
    const orderIds = orders.map(i => i.orderId.toString());

    let fetchedOrders = await getOrdersViaPublicServiceAsync(orderIds);

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrders
    });
};

export let getCompletedOrderList = async (req, res, next) => {

    // 查询施工中的订单
    let orders = await OrderModel.find({ assignee: req.user.phoneNo, orderStatus: OrderStatus.Completed });
    const orderIds = orders.map(i => i.orderId.toString());

    let fetchedOrders = await getOrdersViaPublicServiceAsync(orderIds);

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrders
    });
};


export let getCanceledOrderList = async (req, res, next) => {

    // 查询已经取消的订单
    let orders = await OrderModel.find({ assignee: req.user.phoneNo, orderStatus: OrderStatus.Canceled });
    const orderIds = orders.map(i => i.orderId.toString());

    let fetchedOrders = await getOrdersViaPublicServiceAsync(orderIds);

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrders
    });
};

async function getOrdersViaPublicServiceAsync(orderIds: string[]) {
    const serviceJwtToken = jwt.sign({
        service: config.service.name,
        peerName: config.service.peerName,
    }, config.service.jwtSecret);

    const hostname = config.service.peerHost;
    const port = config.service.peerPort;
    const sharedOrdersPath = `/api/shared/order?token=${serviceJwtToken}`;
    console.log(hostname, sharedOrdersPath);

    let postData = JSON.stringify({
        payload: orderIds
    });

    return new Promise((resolve, reject) => {
        let request = http.request({
            hostname: hostname,
            port: port,
            path: sharedOrdersPath,
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (wxRes) => {
            console.log("response from service api /api/shared/orders");

            if (wxRes.statusCode != 200) {
                console.error(wxRes.statusCode, wxRes.statusMessage);
                return reject(wxRes.statusMessage);
            }

            let orderData = "";
            wxRes.on("data", (chunk) => {
                orderData += chunk;
            });
            wxRes.on("end", async () => {

                try {
                    let result = JSON.parse(orderData);
                    let { code, message, data } = result;
                    if (code !== 0) {
                        return reject(message);
                    }
                    else {
                        return resolve(data);
                    }
                }
                catch (ex) {
                    return reject(ex);
                }
            });
        });
        request.end(postData);
    });
}

export let load = async (req: Request, res: Response, next: NextFunction) => {
    let order = await OrderModel.findOne({ orderId: req.params.orderId });

    if (!order) {
        const err = new APIError("Cannot find order.", httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let fetchedOrder = await getOrderDetailViaPublicServiceAsync(order.orderId.toString());

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrder
    });
};

async function getOrderDetailViaPublicServiceAsync(orderId: string) {
    const serviceJwtToken = jwt.sign({
        service: config.service.name,
        peerName: config.service.peerName,
    }, config.service.jwtSecret);

    const hostname = config.service.peerHost;
    const port = config.service.peerPort;
    const sharedOrderPath = `/api/shared/order/${orderId}?token=${serviceJwtToken}`;
    console.log(hostname, sharedOrderPath);

    return new Promise((resolve, reject) => {
        let request = http.request({
            hostname: hostname,
            port: port,
            path: sharedOrderPath,
            method: "GET",
        }, (wxRes) => {
            console.log("response from service api /api/shared/order");

            if (wxRes.statusCode != 200) {
                console.error(wxRes.statusCode, wxRes.statusMessage);
                return reject(wxRes.statusMessage);
            }

            let orderData = "";
            wxRes.on("data", (chunk) => {
                orderData += chunk;
            });
            wxRes.on("end", async () => {

                try {
                    let result = JSON.parse(orderData);
                    let { code, message, data } = result;
                    if (code !== 0) {
                        return reject(message);
                    }
                    else {
                        return resolve(data);
                    }
                }
                catch (ex) {
                    return reject(ex);
                }
            });
        });

        request.end();
    });
}


/*

export let getContract = async (req, res, next) => {
    let ordercontractObj = await orderContractModel.findOne({ orderid: req.query.orderid });
    if (ordercontractObj) {
        return res.json(ordercontractObj);
    }
    else {
        return res.json({
            error: true,
            message: "error : getContract error",
            data: {
                orderid: req.body.orderid
            }
        });
    }
}

*/

export let create = async (req, res, next) => {

    let existingOrder;
    if (req.body.orderId) {
        existingOrder = await OrderModel.findOne({ orderId: req.body.orderId });
    }
    const order = new OrderModel(req.body);
    //   order.assignee = req.user.phoneNo;
    await order.save();

    return res.json({
        code: 0,
        message: 'OK',
        data: order
    });
};

export default { list, load, create };
