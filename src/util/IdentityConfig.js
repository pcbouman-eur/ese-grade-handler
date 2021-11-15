const IdentityConfig = {
    keyTypes: [
            { name: 'erna', pattern: /\d{6}[a-z]{2}/g},
            { name: 'student number', pattern: /\d{6}/g}
    ],
    conversions: [
        {to: 'student number', from: ['erna']}
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
    },
    preferredType(types) {
        for (let kt of this.keyTypes) {
            if (types.includes(kt.name)) {
                return kt.name;
            }
        }
        throw 'No preferred type is available';
    },
    getPattern(name) {
        for (let obj of this.keyTypes) {
            if (obj.name == name) {
                return obj.pattern;
            }
        }
    }
};

export default IdentityConfig;