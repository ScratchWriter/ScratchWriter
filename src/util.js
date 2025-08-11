function objectMap(obj, cb) {
    return Object.fromEntries(Object.entries(obj).map(cb));
}

module.exports = {
    objectMap,
}

const crypto = require('crypto');

module.exports.md5_hex_hash = (data) => {
    return crypto.createHash('md5').update(data).digest('hex');
}