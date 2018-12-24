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

router.post('/create', passport.authenticate('jwt'), orderCtrl.create);

router.post('/editOrderAmount', validate(paramValidation.editOrderAmount), orderCtrl.editOrderAmount);

router.post('/appendOrderWorkToOrder', validate(paramValidation.appendOrderWorkToOrder), orderCtrl.appendOrderWorkToOrder);

router.post('/editOrderWorkToOrder', validate(paramValidation.editOrderWorkToOrder), orderCtrl.editOrderWorkToOrder);

router.get('/getOrderDiarys', validate(paramValidation.getOrderDiarys), orderCtrl.getOrderDiarys);

router.post('/createOrderDiary', validate(paramValidation.createOrderDiary), orderCtrl.createOrderDiary);

router.post('/createOrderContract', validate(paramValidation.createOrderContract), orderCtrl.createOrderContract);

export default router;
