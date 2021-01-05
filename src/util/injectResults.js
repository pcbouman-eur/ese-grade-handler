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

function injectResults(column, wb, gradingPolicy, identityConfig, attendance) {
    const errors = [], warnings = [], missing = [];
    const sheet = wb.Sheets[SHEET_NAME];
    const attendanceMap = attendanceKeys(attendance);
    if (sheet) {
        let idcell = sheet[ID_CELL];
        let rescell = sheet[RES_CELL];
        if (!idcell || idcell.v != ID_VAL) {
            errors.push('Incorrect structure for target file. Value "'+ID_VAL+'" was not found in Cell '+ID_CELL);
        }
        else if (!rescell || rescell.v != RES_VAL) {
            errors.push('Incorrect structure for target file. Value "'+RES_VAL+'" was not found in Cell '+RES_CELL);
        }
        else {
            // Proceed
            const processed = new Set();
            const erna_dataset = exportColumns.columnToDataset(column, OUTPUT_KEY);
            console.log(column, OUTPUT_KEY, erna_dataset);
            const std_dataset = {};
            for (let [key, val] of Object.entries(erna_dataset)) {
                std_dataset[identityConfig.convert(OUTPUT_KEY, SHEET_KEY, key)] = val;
            }
            const range = XLSX.utils.decode_range(sheet['!ref']);
            for (let row = FIRST_ROW; row <= range.e.r; row++) {
                const id_ref = XLSX.utils.encode_cell({ c: ID_COL_INDEX, r: row });
                const res_ref = XLSX.utils.encode_cell({ c: RES_COL_INDEX, r: row });
                idcell = sheet[id_ref];
                rescell = sheet[res_ref];
                if (!rescell) {
                    sheet[res_ref] = {t: 's', v: null};
                    rescell = sheet[res_ref];
                }
                const id = idcell.v;
                let failedAtt = checkAttendanceFailed(attendance, id, attendanceMap);
                if (id) {
                    processed.add(id);
                    const result = std_dataset[id];
                    console.log(result, id, std_dataset);
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
    }
    else {
        errors.push('Incorrect structure for target file. Sheet '+SHEET_NAME+' was expected but not found');
    }
    return {wb, errors, warnings, missing};
}

export default injectResults;
