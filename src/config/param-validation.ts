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
};
