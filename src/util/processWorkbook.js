import sheetToDataframe from './sheetToDataframe';
import IdentityConfig from './IdentityConfig';

function checkKeySpec(column, spec) {
    const keySet = new Set();
    const keyCol = [];
    for (let el of column.data) {
        const value = String(el);
        const matches = Array.from(value.matchAll(spec.pattern));
        if (matches.length != 1) {
            return {result: false, error: 'No match for value "'+value+'"'};
        }
        const key = matches[0][0];
        if (keySet.has(key)) {
            return {result: false, error: 'Multiple occurences of "'+value+'"'};
        }
        keySet.add(key);
        keyCol.push(key);
    }
    return {result: true, keyCol};
}

function findKeyColumns(df, config=IdentityConfig) {
    const result = {};
    cols:
    for (let colname of df.columns) {
        for (let keySpec of config.keyTypes) {
            const spec = checkKeySpec(df[colname], keySpec);
            if (spec.result && !(spec.name in result)) {
                result[keySpec.name] = {type: keySpec.name, column: colname, keys: spec.keyCol};
                continue cols;
            }
        }
    }
    return result;
}

function processWorkbook(workbook) {
    const frames = [], skipped = [];
    for (let sheetName of workbook.SheetNames) {
        let error = 'No suitable key column found';
        try {
            const df = sheetToDataframe(workbook.Sheets[sheetName]);
            const keys = findKeyColumns(df);
            if (Object.keys(keys).length > 0) {
                frames.push({sheetName, df, keys});
                error = undefined;
            }
        }
        catch (err) {
            error = 'Sheet has invalid structure';
        }
        if (error) {
            skipped.push({sheetName, error});
        }
    }
    return {frames, skipped};
}

export default processWorkbook;