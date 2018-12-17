import * as passport from 'passport';
import User from '../models/user.model';
import { Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy, IStrategyOptionsWithRequest } from 'passport-local';
// import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import * as https from 'https';

import * as speakeasy from 'speakeasy';

import config from './config';
import UserModel from '../models/user.model';
// Setting username field to phoneNo rather than username
const localOptions: IStrategyOptionsWithRequest = {
    usernameField: 'phoneNo',
    passwordField: 'verificationCode',
    passReqToCallback: true,
};

// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, (req, username, password, done) => {
    console.log('localLogin');
    User.findOne({ username: username }, async (err, user) => {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false);
        }

        // Verify a given token
        const tokenValidates = speakeasy.totp.verify({
            secret: user.securityStamp.toString(),
            encoding: 'base32',
            token: password,
            window: 10  // window: 10 for 5 mins expiration.
        });

        if (!tokenValidates) {
            return done(null, false, {
                message: 'Your login details could not be verified. Please try again.',
            });
        }

        return done(null, user);
    });
});
// Setting JWT strategy options
const jwtOptions: StrategyOptions = {
    // Telling Passport to check BearerToken/query/body for JWT
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
        ExtractJwt.fromBodyField('token')
    ]),
    // Telling Passport where to find the secret
    secretOrKey: config.jwtSecret
    // TO-DO: Add issuer and audience checks
};

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {

    UserModel.findOne({ username: payload.username }).then(user => {
        done(null, user);
    }).catch(error => {
        done(null, false);
    });
});

// const anonymousLogin = new AnonymousStrategy();

(passport).serializeUser(function (user, done) {
    done(null, user);
});

(passport).deserializeUser(function (user, done) {
    done(null, user);
});

(passport).use('jwt', jwtLogin);
(passport).use('local', localLogin);
// (passport).use('anonymous', anonymousLogin);

export default passport;
