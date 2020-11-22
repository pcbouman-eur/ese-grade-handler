const GradingPolicy = {
    alternatives: ['VD', 'NVD', 'VR', 'GGR', 'ONV', 'NO', 'FR'],
    missingValue: 'NO',
    minGrade: 1,
    maxGrade: 10,
    roundingRule(num) {
        return Math.floor(num*10)/10;
    },
    truncateRule(num) {
        return Math.max(this.minGrade, Math.min(this.maxGrade, num));
    },
    finalize(value) {
        if (this.alternatives.includes(value)) {
            return value;
        }
        let num = parseFloat(value);
        num = this.roundingRule(num);
        num = this.truncateRule(num);
        return num.toFixed(1);
    },
    checkError(value) {
        if (this.alternatives.includes(value)) {
            return false;
        }
        try {
            let num = parseFloat(value);
            if (Number.isNaN(num)) {
                return 'Value '+value+' is not a valid result';
            }
            return false;
        }
        catch (err) {
            return err.message;
        }
    },
    checkWarning(value) {
        if (this.alternatives.includes(value)) {
            return false;
        }
        let num = parseFloat(value);
        if (num < this.minGrade) {
            return 'Grade can not be smaller than '+this.minGrade+'. Set to '+this.minGrade;
        }
        if (num > this.maxGrade) {
            return 'Grade can not be greater than '+this.maxGrade+'. Set to '+this.maxGrade;
        }
    }

};

export default GradingPolicy;