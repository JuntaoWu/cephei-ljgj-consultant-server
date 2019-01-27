import * as express from 'express';
const router = express.Router();
const http = require('http');
const https = require('https');
import * as passport from 'passport';

import * as orderCtrl from '../controllers/order.controller';
import { Request, Response, NextFunction } from 'express';

import * as validate from 'express-validation';
import paramValidation from '../config/param-validation';

router.get('/', passport.authenticate('jwt'), orderCtrl.list);

router.get('/:orderId', validate(paramValidation.getOrderDetail), passport.authenticate('jwt'), orderCtrl.load);

router.get('/:orderId/getOrderContract', validate(paramValidation.getOrderContract), orderCtrl.getOrderContract);

router.get('/:orderId/getOrderDiarys', validate(paramValidation.getOrderDiarys), orderCtrl.getOrderDiarys);

router.get('/:orderId/getOrderFunds', validate(paramValidation.getOrderFunds), orderCtrl.getOrderFunds);

router.post('/:orderId/createOrderFundItem', validate(paramValidation.createOrderFundItem), orderCtrl.createOrderFundItem);

router.post('/create', passport.authenticate('jwt'), orderCtrl.create);

router.post('/editOrderAmount', validate(paramValidation.editOrderAmount), orderCtrl.editOrderAmount);

router.post('/appendOrderWorkToOrder', validate(paramValidation.appendOrderWorkToOrder), orderCtrl.appendOrderWorkToOrder);

router.post('/editOrderWorkToOrder', validate(paramValidation.editOrderWorkToOrder), orderCtrl.editOrderWorkToOrder);

router.post('/createOrderDiary', validate(paramValidation.createOrderDiary), orderCtrl.createOrderDiary);

router.post('/createOrderContract', validate(paramValidation.createOrderContract), orderCtrl.createOrderContract);

router.post('/revokeOrderFundItem', orderCtrl.revokeOrderFundItem);

router.post('/createUnifiedOrder', orderCtrl.createUnifiedOrder);

router.get('/getQRCode', passport.authenticate('jwt'), orderCtrl.getQRCode);

export default router;
