import IdentityConfig from "./IdentityConfig";

function extractKeys(keys, outputKey) {
    if (keys[outputKey]) {
        return keys[outputKey].keys;
    }
    for (const conv_spec of IdentityConfig.conversions) {
        if (conv_spec.to == outputKey) {
            for (const src_key of conv_spec.from) {
                if (keys[src_key]) {
                    return keys[src_key].keys.map(v => IdentityConfig.convert(src_key, outputKey, v));
                }
            }
        }
    }
    throw 'Unable to convert data from this from to "'+outputKey+'"';
}

function columnToDataset(col, outputKey, allKeys) {
    console.log(col);
    if (col.type == 'df') {
        const col_keys = extractKeys(col.frame.keys, outputKey);
        const col_data = col.frame.df[col.column].data;
        const pairs = {};
        col_keys.forEach((key, idx) => {
            pairs[key] = col_data[idx];
        });
        return pairs;
    }
    if (col.type == 'attendance-cat') {
        const result = {};
        const th = col.data.threshold;
        for (let std of allKeys) {
            const el = col.data.data[std];
            result[std] = 'NO DATA';
            if (el) {
                if (el.exemption) {
                    result[std] = 'EXEMPTION';
                }
                else if (el.sessionsPresent.size >= th) {
                    result[std] = 'PASS';
                }
                else {
                    result[std] = 'FAIL';
                }
            }
        }
        return result;
    }
    if (col.type == 'attendance-bool') {
        const result = {};
        const th = col.data.threshold;
        for (let std of allKeys) {
            result[std] = 0;
            const el = col.data.data[std];
            if (el) {
                if (el.exemption || el.sessionsPresent.size >= th) {
                    result[std] = 1;
                }
            }
        }
        return result;
    }
    if (col.type == 'attendance-count') {
        const result = {};
        for (let std of allKeys) {
            const el = col.data.data[std];
            if (el && el.sessionsPresent) {
                result[std] = el.sessionsPresent.size;
            }
        }
        return result;
    }    
    return {};
}

function makePredicate(outputKey, allKeys, filter) {
    if (!filter) {
        return () => true;
    }
    const col1data = columnToDataset(filter.lhs.data, outputKey, allKeys);
    let rhsFun = () => null;
    if (filter.cmp.cmpType == 'column') {
        const col2data = columnToDataset(filter.rhs.data, outputKey, allKeys);
        rhsFun = (key) => col2data[key];
    }
    if (filter.cmp.cmpType == 'value') {
        rhsFun = () => filter.rhs;
    }
    const resultSet = new Set();
    for (const key of allKeys) {
        const val1 = col1data[key];
        const val2 = rhsFun(key);
        if (filter.cmp.comparison(val1, val2)) {
            resultSet.add(key);
        }
    }
    return (key) => resultSet.has(key);
}

function makeTable(outputKey, allKeys, outputCols, dropEmptyStudents, filter) {
    const datasets = outputCols.map(col => columnToDataset(col.data, outputKey, allKeys));

    const predicate = makePredicate(outputKey, allKeys, filter);

    const header = [outputKey];
    for (const oc of outputCols) {
        header.push(oc.name);
    }

    const table = [header];

    // TODO: data
    console.log(allKeys);
    for (const key of allKeys) {
        if (!predicate(key)) {
            continue;
        }
        const row = [key];
        let empty = true;
        for (const ds of datasets) {
            const val = ds[key];
            console.log(ds, key, val);
            if (val || val === 0 || val === false) {
                row.push(val);
                empty=false;
            }
            else {
                row.push(null);
            }
        }
        if (!empty || !dropEmptyStudents) {
            table.push(row);
        }
    }
    
    return table;
}

export default {makeTable, columnToDataset};
