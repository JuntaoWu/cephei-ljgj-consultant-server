import * as multer from 'multer';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const filename = uuid().replace(/-/g, '');
        if (file.mimetype == 'image/jpeg') {
            return cb(null, filename + '.jpg');
        }
        else if (file.mimetype == 'image/png') {
            return cb(null, filename + '.png');
        }
        else {
            return filename;
        }
    }
});

export default multer({
    dest: 'uploads',
    storage: storage
});