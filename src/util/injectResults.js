import exportColumns from '../util/exportColumns';
import XLSX from 'xlsx';

const SHEET_NAME = 'Toetslijst';
const ID_CELL = 'A8';
const ID_VAL = 'Studentnummer';
const ID_COL_INDEX = 0;
const RES_CELL = 'D8';
const RES_VAL = 'Resultaat';
const RES_COL_INDEX = 3;
const FIRST_ROW = 8;

// TODO: this should definitely be a lot more flexible
const OUTPUT_KEY = 'erna';
const SHEET_KEY = 'student number';

function resultPreflight(id, result, errors, warnings, gradingPolicy, failedAtt) {
    if (result) {
        const error = gradingPolicy.checkError(result);
        if (error) {
            errors.push('Error for student '+id+' : '+error);
            return null;
        }
        const warning = gradingPolicy.checkWarning(result);
        if (warning) {
            warnings.push('Warning for student '+id+' : '+warning);
            return gradingPolicy.finalize(result);
        }
        else {
            return gradingPolicy.finalize(result, failedAtt);
        }
    }
    else {
        warnings.push('Injected '+gradingPolicy.missingValue
            +' for student '+id+' since there was no data.' );
        return gradingPolicy.missingValue;
    }
}

function attendanceKeys(attendance) {
    const result = {};
    if (attendance) {
        for (const key of Object.keys(attendance.data)) {
            result[key.substring(0,6)] = key;
        }
    }
    return result;
}

function checkAttendanceFailed(attendance, id, attendanceMap) {
    if (!attendance) {
        return false;
    }
    const convId = attendanceMap[id];
    if (!convId || !attendance.data[convId]) {
        // No data for this student
        return true;
    }
    const data = attendance.data[convId];
    return data.sessionsPresent.size < attendance.threshold;
}

function processResult(column, gradingPolicy, identityConfig, attendance) {
    const erna_dataset = exportColumns.columnToDataset(column, OUTPUT_KEY);
    const attendanceMap = attendanceKeys(attendance);
    const std_dataset = {};
    const errors = [], warnings = [];
    for (let [key, result] of Object.entries(erna_dataset)) {
        const conv_key = identityConfig.convert(OUTPUT_KEY, SHEET_KEY, key);
        let failedAtt = checkAttendanceFailed(attendance, conv_key, attendanceMap);
        const res = resultPreflight(conv_key, result, errors, warnings, gradingPolicy, failedAtt);
        std_dataset[conv_key] = res;
    }
    return {data: std_dataset, errors, warnings};
}

function checkSheetStructure(sheet, errors) {
    const idcell = sheet[ID_CELL];
    const rescell = sheet[RES_CELL];
    if (!idcell || idcell.v != ID_VAL) {
        errors.push('Incorrect structure for target file. Value "'+ID_VAL+'" was not found in Cell '+ID_CELL);
        return false;
    }
    else if (!rescell || rescell.v != RES_VAL) {
        errors.push('Incorrect structure for target file. Value "'+RES_VAL+'" was not found in Cell '+RES_CELL);
        return false;
    }
    return true;
}

function injectResults(column, wb, gradingPolicy, identityConfig, attendance) {
    const errors = [], warnings = [], missing = [];
    const sheet = wb.Sheets[SHEET_NAME];
    const attendanceMap = attendanceKeys(attendance);
    if (sheet && checkSheetStructure(sheet, errors)) {
        // Proceed
        const processed = new Set();
        const erna_dataset = exportColumns.columnToDataset(column, OUTPUT_KEY);
        const std_dataset = {};
        for (let [key, val] of Object.entries(erna_dataset)) {
            const conv_key = identityConfig.convert(OUTPUT_KEY, SHEET_KEY, key);
            std_dataset[conv_key] = val;
        }
        const range = XLSX.utils.decode_range(sheet['!ref']);
        for (let row = FIRST_ROW; row <= range.e.r; row++) {
            const id_ref = XLSX.utils.encode_cell({ c: ID_COL_INDEX, r: row });
            const res_ref = XLSX.utils.encode_cell({ c: RES_COL_INDEX, r: row });
            const idcell = sheet[id_ref];
            let rescell = sheet[res_ref];
            if (!rescell) {
                sheet[res_ref] = {t: 's', v: null};
                rescell = sheet[res_ref];
            }
            const id = idcell.v;
            let failedAtt = checkAttendanceFailed(attendance, id, attendanceMap);
            if (id) {
                processed.add(id);
                const result = std_dataset[id];
                //console.log(result, id, std_dataset);
                rescell.v = resultPreflight(id, result, errors, warnings, gradingPolicy, failedAtt);
            }
        }

        for (let [id,result] of Object.entries(std_dataset)) {
            let failedAtt = checkAttendanceFailed(attendance, id, attendanceMap);
            if (!processed.has(id)) {
                missing.push({id, result: resultPreflight(id, result, errors, warnings, gradingPolicy, failedAtt)});
            }
        }
    }
    else {
        errors.push('Incorrect structure for target file. Sheet '+SHEET_NAME+' was expected but not found');
    }
    return {wb, errors, warnings, missing};
}

function removeRowsFromSheet(rows, sheet) {
    if (!rows.length) {
        return;
    }
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const rs = rows.filter(i => i >= range.s.r && i <= range.e.r).sort((i,j) => i-j);
    let skip = 0;
    for (let r = range.s.r; r <= range.e.r; r++) {
        if (skip < rs.length && r == rs[skip]) {
            // This row should be skipped, delete the cells
            for (let c=range.s.c; c <= range.e.c; c++) {
                const cell_ref = XLSX.utils.encode_cell({c, r});
                if (sheet[cell_ref]) {
                    delete sheet[cell_ref];
                }
            }
            skip++;
        }
        else {
            if (skip == 0) {
                // No need to skip yet
                continue;
            }
            for (let c=range.s.c; c <= range.e.c; c++) {
                const cell_ref = XLSX.utils.encode_cell({c, r});
                const shift_ref = XLSX.utils.encode_cell({c, r: r-skip});
                if (sheet[cell_ref]) {
                    sheet[shift_ref] = sheet[cell_ref];
                    delete sheet[cell_ref];
                }
            }
        }
    }

        
}

function mutateResults(results, wb) {
    const errors = [], warnings = [], missing = [];
    const sheet = wb.Sheets[SHEET_NAME];
    if (sheet && checkSheetStructure(sheet, errors)) {
        const remove_rows = [];
        const range = XLSX.utils.decode_range(sheet['!ref']);
        for (let row = FIRST_ROW; row <= range.e.r; row++) {
            const id_ref = XLSX.utils.encode_cell({ c: ID_COL_INDEX, r: row });
            const res_ref = XLSX.utils.encode_cell({ c: RES_COL_INDEX, r: row });
            const idcell = sheet[id_ref];
            const id = idcell.v;
            if (id && results[id]) {
                const res = results[id];
                const rescell = sheet[res_ref];
                if (!rescell) {
                    sheet[res_ref] = {t: 's', v: res};
                }
                else {
                    rescell.v = res;
                }
            }  
            else {
                remove_rows.push(row);
            }
        }
        removeRowsFromSheet(remove_rows, sheet);
    }
    else {
        errors.push('Incorrect structure for target file. Sheet '+SHEET_NAME+' was expected but not found');
    }
    return {wb, errors, warnings, missing};
}

function readResultEntries(wb) {
    const errors = [], warnings = [], missing = [];
    const sheet = wb.Sheets[SHEET_NAME];
    const std_dataset = {};
    if (sheet && checkSheetStructure(sheet, errors)) {
        // Proceed
        const range = XLSX.utils.decode_range(sheet['!ref']);
        for (let row = FIRST_ROW; row <= range.e.r; row++) {
            const id_ref = XLSX.utils.encode_cell({ c: ID_COL_INDEX, r: row });
            const res_ref = XLSX.utils.encode_cell({ c: RES_COL_INDEX, r: row });
            const idcell = sheet[id_ref];
            const rescell = sheet[res_ref];
            const key = idcell ? idcell.v : undefined;
            const result = rescell ? rescell.v : undefined;
            if (!key) {
                continue;
            }
            if (result) {
                std_dataset[key] = {result, student: key, row};
            }
            else {
                warnings.push('Missing result for student '+key+' in row '+row);
            }
        }
    }
    else {
        errors.push('Incorrect structure for target file. Sheet '+SHEET_NAME+' was expected but not found');
    }
    return {entries: std_dataset, errors, warnings, missing};
}

export {injectResults, readResultEntries, processResult, mutateResults};
