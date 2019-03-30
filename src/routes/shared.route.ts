import * as express from 'express';
const router = express.Router();
const http = require('http');
const https = require('https');
import * as passport from 'passport';
import { Request, Response, NextFunction } from 'express';

import * as validate from 'express-validation';
import paramValidation from '../config/param-validation';

import * as sharedCtrl from '../controllers/shared.controller';

router.post('/assignOrder',
    validate(paramValidation.assignOrder),
    passport.authenticate("jwtService"),
    sharedCtrl.assignOrder);

export default router;