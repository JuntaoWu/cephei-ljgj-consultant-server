import * as express from 'express';
const router = express.Router();
const http = require('http');
const https = require('https');
import * as passport from 'passport';

import * as backlogCtrl from '../controllers/backlog.controller';
import { Request, Response, NextFunction } from 'express';

import * as validate from 'express-validation';
import paramValidation from '../config/param-validation';

router.get('/:orderId', passport.authenticate('jwt'), backlogCtrl.load);

export default router;