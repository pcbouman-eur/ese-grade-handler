function columnToDataset(col, outputKey) {
    const col_keys = col.frame.keys[outputKey].keys;
    const col_data = col.frame.df[col.column].data;
    const pairs = {};
    col_keys.forEach((key, idx) => {
        pairs[key] = col_data[idx];
    });
    return pairs;
}

function makeTable(outputKey, allKeys, outputCols, dropEmptyStudents) {
    const datasets = outputCols.map(col => columnToDataset(col.data, outputKey));

    const header = [outputKey];
    for (const oc of outputCols) {
        header.push(oc.name);
    }

    const table = [header];

    // TODO: data
    for (const key of allKeys) {
        const row = [key];
        let empty = true;
        for (const ds of datasets) {
            if (ds[key]) {
                row.push(ds[key]);
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
