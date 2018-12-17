import * as Joi from 'joi';

export default {
    // POST /api/auth/getVerificationCode
    getVerificationCode: {
        body: {
            phoneNo: Joi.string().regex(/^[1-9][0-9]{10}$/).required()
        }
    },
    // GET /api/order/:orderId
    getOrderDetail: {
        params: {
            orderId: Joi.string().required()
        }
    },
};
