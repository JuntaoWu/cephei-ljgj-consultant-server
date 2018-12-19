import * as express from 'express';
import * as validate from 'express-validation';
import paramValidation from '../config/param-validation';
//import authCtrl from '../controllers/auth.controller';

import * as authCtrl from '../controllers/auth.controller';
import config from '../config/config';
import * as passport from 'passport';

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
    .post(validate(paramValidation.login), passport.authenticate("local", { failWithError: true }), authCtrl.login);

/** POST /api/auth/getVerificationCode - Allow anyone to send SMS code via phoneNo */
router.route('/getVerificationCode')
    .post(validate(paramValidation.getVerificationCode), authCtrl.getVerificationCode);

export default router;
