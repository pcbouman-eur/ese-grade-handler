
function exportColumns(outputKey, allKeys, outputCols) {
    const datasets = outputCols.map(
        col => {
            console.log(col);
            const col_keys = col.data.frame.keys[outputKey].keys;
            const col_data = col.data.frame.df[col.data.column].data;
            const pairs = {};
            col_keys.forEach((key, idx) => {
                pairs[key] = col_data[idx];
            });
            return pairs;
        }
    );

    const header = [outputKey];
    for (const oc of outputCols) {
        header.push(oc.name);
    }

    const table = [header];

    // TODO: data
    for (const key of allKeys) {
        const row = [key];
        for (const ds of datasets) {
            if (ds[key]) {
                row.push(ds[key]);
            }
            else {
                row.push(null);
            }
        }
        table.push(row);
    }
    
    return table;
}

export default exportColumns;