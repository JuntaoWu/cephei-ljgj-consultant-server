import * as multer from 'multer';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import APIError from '../helpers/APIError';
import * as httpStatus from 'http-status';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(file);
        const directory = path.join(__dirname, `../../static/consultant/`);
        return cb(null, directory);
    },
    filename: (req, file, cb) => {
        console.log(file);
        // keep original name
        const filename = file.originalname;
        return cb(null, filename);
        // const filename = uuid().replace(/-/g, '');
        // if (file.mimetype == 'image/jpeg') {
        //     return cb(null, filename + '.jpg');
        // }
        // else if (file.mimetype == 'image/png') {
        //     return cb(null, filename + '.png');
        // }
        // else {
        //     return cb(null, filename);
        // }
    }
});

export default multer({
    dest: 'static/consultant',
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            return cb(new APIError('only image files accepted', httpStatus.FORBIDDEN, true), false);
        }
        return cb(null, true);
    }
});