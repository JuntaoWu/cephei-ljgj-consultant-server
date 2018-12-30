import * as Joi from 'joi';

export default {
    // POST /api/auth/getVerificationCode
    getVerificationCode: {
        body: {
            phoneNo: Joi.string().regex(/^[1-9][0-9]{10}$/).required()
        }
    },
    login: {
        body: {
            phoneNo: Joi.string().regex(/^[1-9][0-9]{10}$/).required(),
            verificationCode: Joi.string().regex(/^\d{6}$/).required()
        }
    },
    // GET /api/order/:orderId
    getOrderDetail: {
        params: {
            orderId: Joi.string().required()
        }
    },
    // Post /api/order/EditorderAmount
    editOrderAmount: {
        body: {
            orderId: Joi.string().required()
        }
    },
    // GET /api/order/:orderId
    appendOrderWorkToOrder: {
        body: {
            orderId: Joi.string().required()
        }
    },
     // GET /api/order/:orderId
     editOrderWorkToOrder: {
        body: {
            orderWorkid: Joi.string().required()
        }
    },
     // GET /api/order/:orderId
     createOrderFundItem: {
        body: {
            orderId: Joi.string().required()
        }
    },
     // GET /api/order/:orderId
     getOrderDiarys: {
        params: {
            orderId: Joi.string().required()
        }
    },
    // GET /api/order/:orderId
    getOrderFunds: {
        params: {
            orderId: Joi.string().required()
        }
    },
    getOrderContract: {
        params: {
            orderId: Joi.string().required()
        }
    },
    createOrderDiary: {
        body: {
            orderId: Joi.string().required()
        }
    },
    createOrderContract: {
        body: {
            orderId: Joi.string().required()
        }
    },
};
