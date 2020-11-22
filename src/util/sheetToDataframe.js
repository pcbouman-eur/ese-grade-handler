import XLSX from 'xlsx';
import {DataFrame} from 'danfojs/dist/core/frame';

function sheetToDataframe(worksheet, header_index=1, data_index=2) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const column_names = [], data = [], column_indices = [];
    for (let R = header_index - 1; R <= range.e.r; ++R) {
        if (R == header_index - 1) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                //Populate column_names
                const cell_ref = XLSX.utils.encode_cell({ c: C, r: header_index - 1 });
                    if (worksheet[cell_ref]) {
                    const header = worksheet[cell_ref].v;
                    if (header) {
                        column_names.push(header.trim());
                        column_indices.push(C);
                    }
                }
            }
        }
        else if (R >= data_index - 1) {
            //Populate corresponding data row
            const row_data = [];
            let add = false;
            for (var C of column_indices) {
                const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
                if (worksheet[cell_ref]) {
                    const val = worksheet[cell_ref].v;
                    row_data.push(val);
                    if (val) {
                        add = true;
                    }                    
                }
                else {
                    row_data.push(null);
                }
            }
            if (add) {
                data.push(row_data);
            }

        }
    }
    let df = new DataFrame(data, { columns: column_names });
    return df;
}

export default sheetToDataframe;