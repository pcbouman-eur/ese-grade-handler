const IdentityConfig = {
    keyTypes: [
            { name: 'erna', pattern: /\d{6}[a-z]{2}/g},
            { name: 'student number', pattern: /\d{6}/g}
    ],
    convert(fromType, toType, val) {
        // You'd probably want a fourth argument with some current database?
        if (fromType == toType) {
            return val;
        }
        if (fromType == 'erna' && toType == 'student number') {
            return val.substr(0,6);
        }
        throw 'Conversion from '+fromType+' to '+toType+' not supported';
    }
};

export default IdentityConfig;