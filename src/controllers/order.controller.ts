
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

import * as moment from 'moment';

import OrderDiaryModel from '../models/orderdiary.mode';

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


/// 增加施工内容到订单
export let appendOrderWorkToOrder = async (req: Request, res: Response, next: NextFunction) => {
    let order = await OrderModel.findOne({ orderId: req.body.orderId });

    if (!order) {
        const err = new APIError("Cannot find order.", httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let fetchedOrder = await appendOrderWorkToOrderAsync(order.orderId.toString(), req.body.orderWork.toString());

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrder
    });
};

/// 增加施工内容到订单 http 请求
async function appendOrderWorkToOrderAsync(orderId: string, orderWork: string) {
    const serviceJwtToken = jwt.sign({
        service: config.service.name,
        peerName: config.service.peerName,
    }, config.service.jwtSecret);

    const hostname = config.service.peerHost;
    const port = config.service.peerPort;
    const sharedOrderPath = `/api/shared/order/appendOrderWorkToOrder?token=${serviceJwtToken}`;
    console.log(hostname, sharedOrderPath);

    let postData = JSON.stringify({
        orderId: orderId,
        orderWork: orderWork
    });

    return new Promise((resolve, reject) => {
        let request = http.request({
            hostname: hostname,
            port: port,
            path: sharedOrderPath,
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
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
        request.end(postData);
    });
}

/// 编辑施工内容到订单
export let editOrderWorkToOrder = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.body.orderWorkid) {
        const err = new APIError("Cannot find order.", httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let fetchedOrder = await editOrderWorkToOrderAsync(req.body.orderWorkid.toString(), req.body.orderWork.toString());

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrder
    });
};

/// 增加施工内容到订单 http 请求
async function editOrderWorkToOrderAsync(orderWorkid: string, orderWork: string) {
    const serviceJwtToken = jwt.sign({
        service: config.service.name,
        peerName: config.service.peerName,
    }, config.service.jwtSecret);

    const hostname = config.service.peerHost;
    const port = config.service.peerPort;
    const sharedOrderPath = `/api/shared/order/editOrderWorkToOrder?token=${serviceJwtToken}`;
    console.log(hostname, sharedOrderPath);

    let postData = JSON.stringify({
        orderWorkid: orderWorkid,
        orderWork: orderWork
    });

    return new Promise((resolve, reject) => {
        let request = http.request({
            hostname: hostname,
            port: port,
            path: sharedOrderPath,
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
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
        request.end(postData);
    });
}



export let editOrderAmount = async (req: Request, res: Response, next: NextFunction) => {
    let order = await OrderModel.findOne({ orderId: req.body.orderId });

    if (!order) {
        const err = new APIError("Cannot find order.", httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let fetchedOrder = await editOrderAmountAsync(order.orderId.toString(), req.body.orderAmount.toString());

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrder
    });
};

async function editOrderAmountAsync(orderId: string, orderAmount: Number) {
    const serviceJwtToken = jwt.sign({
        service: config.service.name,
        peerName: config.service.peerName,
    }, config.service.jwtSecret);

    const hostname = config.service.peerHost;
    const port = config.service.peerPort;
    const sharedOrderPath = `/api/shared/order/editOrderAmount?token=${serviceJwtToken}`;
    console.log(hostname, sharedOrderPath);

    let postData = JSON.stringify({
        orderId: orderId,
        orderAmount: orderAmount
    });

    return new Promise((resolve, reject) => {
        let request = http.request({
            hostname: hostname,
            port: port,
            path: sharedOrderPath,
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
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
        request.end(postData);
    });
}


/*
    获取订单折扣金额，根据不同条件获取订单折扣金额
*/
let getOrderDiaryThemeByType = function (diarytype) {
    switch (diarytype) {
        case "1":
            {
                return "联系用户";
            }
            break;
        case "2":
            {
                return "上门查看";
            }
            break;
        case "3":
            {
                return "准备施工";
            }
            break;
        case "4":
            {
                return "正在施工";
            }
            break;
        case "5":
            {
                return "项目完成";
            }
            break;
        case "6":
            {
                return "项目中止/取消";
            }
            break;
        case "7":
            {
                return "其他";
            }
            break;
    }
    return "其他";
}

//创建订单日志
export let createOrderDiary = async (req: Request, res: Response, next: NextFunction) => {
    let order = await OrderModel.findOne({ orderId: req.body.orderId });

    if (!order) {
        return res.json({
            code: -1,
            message: "error",
            data: null
        });
    }

    let diaryid = `ORDER_DIARY_${_.random(10000, 99999)}_${moment().format(config.formats.idDateFormat)}`;

    let theme = getOrderDiaryThemeByType(req.body.orderDiaryType);

    let diaryitem = new OrderDiaryModel({
        orderDiaryId: diaryid,
        orderId: req.body.orderId,
        orderDiaryTheme: theme,//
        orderDiaryType: req.body.orderDiaryType,//
        orderDiaryContent: req.body.orderDiaryContent,
        diaryPicUrls: req.body.diaryPicUrls
    });

    let savedContract = await diaryitem.save();

    return res.json({
        code: 0,
        message: "OK",
        data: {
            orderDiaryId: diaryid,
            orderDiaryTheme: theme
        }
    });
};



//获取订单日志
export let getOrderDiarys = async (req: Request, res: Response, next: NextFunction) => {

    let diarys = await OrderDiaryModel.find({ orderId: req.params.orderId });

    if (!diarys) {
        return res.json({
            code: -1,
            message: "error",
            data: null
        });
    }
    else {
        return res.json(diarys);
    }

};

//创建订单合同
export let createOrderContract = async (req: Request, res: Response, next: NextFunction) => {
    let order = await OrderModel.findOne({ orderId: req.body.orderId });

    if (!order) {
        const err = new APIError("Cannot find order.", httpStatus.NOT_FOUND, true);
        return next(err);
    }

    let fetchedOrder = await createOrderContractAsync(order.orderId.toString(), req.body.contractUrls);

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrder
    });
};


async function createOrderContractAsync(orderId: string, contractUrls: Array<String>) {
    const serviceJwtToken = jwt.sign({
        service: config.service.name,
        peerName: config.service.peerName,
    }, config.service.jwtSecret);

    const hostname = config.service.peerHost;
    const port = config.service.peerPort;
    const sharedOrderPath = `/api/shared/order/createOrderContract?token=${serviceJwtToken}`;
    console.log(hostname, sharedOrderPath);

    let postData = JSON.stringify({
        orderId: orderId,
        contractUrls: contractUrls
    });

    return new Promise((resolve, reject) => {
        let request = http.request({
            hostname: hostname,
            port: port,
            path: sharedOrderPath,
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
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
        request.end(postData);
    });
}



export let getOrderContract = async (req, res, next) => {

    // 查询准备中的订单
    let orderobj = await OrderModel.findOne({ orderId: req.params.orderId });
    if (!orderobj) {
        return res.json({
            code: -1,
            message: "error : can't find order ",
            data: null
        });
    }

    let fetchedOrders = await getOrderContractAsync(req.params.orderId);

    return res.json({
        code: 0,
        message: 'OK',
        data: fetchedOrders
    });
};




//获取合同
async function getOrderContractAsync(orderId: string) {
    const serviceJwtToken = jwt.sign({
        service: config.service.name,
        peerName: config.service.peerName,
    }, config.service.jwtSecret);

    const hostname = config.service.peerHost;
    const port = config.service.peerPort;
    const sharedOrderPath = `/api/shared/order/${orderId}/getOrderContract/?token=${serviceJwtToken}`;
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
    //   order.assignee = req.user.phoneNo;
    await order.save();

    return res.json({
        code: 0,
        message: 'OK',
        data: order
    });
};




export default { list, load, create };
