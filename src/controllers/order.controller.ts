import OrderModel, { Order, OrderStatus } from '../models/order.model';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import * as _ from 'lodash';
import jwt from 'jsonwebtoken';
import http from 'http';
import config from '../config/config';

export let list = async (req: Request, res: Response, next: NextFunction) => {

    // 查询施工中的订单
    let orders = await OrderModel.find({ assignee: req.user.phoneNo, orderStatus: OrderStatus.InProgress });
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

    return new Promise((resolve, reject) => {
        let request = http.request({
            hostname: hostname,
            port: port,
            path: sharedOrdersPath,
            method: "POST",
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

        request.end(orderIds);
    });
}

export let load = async (req: Request, res: Response, next: NextFunction) => {
    let order = await OrderModel.findOne({ orderId: req.params.orderId });

    let fetchedOrder = await getOrderDetailViaPublicServiceAsync(order.orderId.toString());

    return res.json({
        code: 0,
        message: 'OK',
        data: order
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

export let create = async (req, res, next) => {

    let existingOrder;
    if (req.body.orderId) {
        existingOrder = await OrderModel.findOne({ orderId: req.body.orderId });
    }

    const order = new OrderModel(req.body);
    order.assignee = req.user.phoneNo;
    await order.save();

    return res.json({
        code: 0,
        message: 'OK',
        data: order
    });
};

export default { list, load, create };
