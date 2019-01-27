import * as express from 'express';
const router = express.Router();
const http = require('http');
const https = require('https');
import * as passport from 'passport';

import * as uploadCtrl from '../controllers/upload.controller';
import { Request, Response, NextFunction } from 'express';

import * as validate from 'express-validation';
import paramValidation from '../config/param-validation';
import multer from '../config/multer';

router.post('/:category', passport.authenticate('jwt'), multer.single('file'), uploadCtrl.post);

export default router;