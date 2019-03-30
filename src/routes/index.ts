import * as express from 'express';

import authRouter from './auth.route';
import orderRouter from './order.route';
import backlogRouter from './backlog.route';
import uploadRouter from './upload.route';
import sharedRouter from './shared.route';

const router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.use('/auth', authRouter);
router.use('/order', orderRouter);
router.use('/backlog', backlogRouter);
router.use('/upload', uploadRouter);
router.use('/shared', sharedRouter);

export default router;
