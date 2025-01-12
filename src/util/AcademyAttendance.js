import XLSX from 'xlsx';
import {DataFrame} from 'danfojs/dist/core/frame';

const SHEET_KEY = 'Export';

const SESSION_VALUES = ['Y', 'N', '/']
const OTHER_VALUE = '_OTHER';
const BLANK_VALUE = '_BLANK';

const EXEMPTION_COL = 'Vrijstelling';
const EXEMPTION_TRUE_VALUE = 'Y';
const ID_COL = 'Studentnummer';
const NAME_COL = 'Naam';
const GROUP_COL = 'Groep';
const ABSENT_COL = 'Afwezig';
const SESSION_COUNT_COL = 'Aantal Lessen';
const NOT_RECORDED_COL = 'Geen aanwezigheid bijgehouden';
const PRESENT_COLS = ['Aanwezig', 'Aanwezig, niet verwacht'];

// Just a very basic wrapper function
function academyAttendanceBookToFrame(workbook) {
    return academyAttendanceSheetToFrame(workbook.Sheets[SHEET_KEY]);
}

// This function takes a raw worksheet from academy attendance and computes a relevant dataframe
function academyAttendanceSheetToFrame(worksheet) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Process first two rows to determine data and session fields
    const header = [];
    const header_cols = [];
    const session_cols = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
        const header_a = worksheet[XLSX.utils.encode_cell({ c, r: 0})]?.v;
        const header_b = worksheet[XLSX.utils.encode_cell({ c, r: 1})]?.v;
        if (!header_a) {
            console.log(`Skipping column ${c} as it has no header`);
            continue;
        }
        if (!header_b) {
            header_cols.push(c);
            header.push(header_a);
        }
        else {
            session_cols.push(c);
        }
    }

    const columns = [...header, ...SESSION_VALUES.map(k => `Sessions ${k}`), 'Other sessions', 'Blank sessions'];

    // Now construct the dataframe
    const data = [];
    for (let r = 2; r <= range.e.r; r++) {
        const row = [];
        // First collect the datafields
        for (let c of header_cols) {
            const cell_ref = XLSX.utils.encode_cell({ c, r});
            const cell_val = worksheet[cell_ref]?.v;
            row.push(cell_val);
        }

        const counts = SESSION_VALUES.reduce((a,v) => ({...a, [v]: 0}), {[OTHER_VALUE]: 0, [BLANK_VALUE]: 0});
        for (let c of session_cols) {
            const cell_ref = XLSX.utils.encode_cell({ c, r});
            const cell_val = worksheet[cell_ref]?.v;
            if (!cell_val) {
                counts[BLANK_VALUE] += 1;
            }
            else if (SESSION_VALUES.includes(cell_val)) {
                counts[cell_val] += 1;
            }
            else {
                counts[OTHER_VALUE] += 1;
            }
        }

        for (let c of SESSION_VALUES) {
            row.push(counts[c])
        }
        row.push(counts[OTHER_VALUE]);
        row.push(counts[BLANK_VALUE]);

        data.push(row);
    }

    const df = new DataFrame(data, { columns });
    return df;
}

// This function tries to determine the most common number of sessions observed for students
function determineCommonSessionCount(df) {
    let mostCommon = 0;
    let mostCommonFreq = 0;
    const frequencies = {};
    const session_counts = df[SESSION_COUNT_COL].data;
    const not_recorded_counts = df[NOT_RECORDED_COL].data;
    for (let r of df.index) {
        const count = session_counts[r] - not_recorded_counts[r];
        if (!frequencies[count]) {
            frequencies[count] = 1
        }
        else {
            frequencies[count] += 1
        }
        if (frequencies[count] > mostCommonFreq) {
            mostCommon = count;
            mostCommonFreq = frequencies[count];
        }
    }
    return mostCommon;
}

const STATUS_DESCRIPTIONS = {
    'VD' : 'Passed',
    'NVD' : 'Not Passed',
    'VR' : 'Exemption'
}

function determineAttendanceStatus(df, minimum_attendance, present_colnames=PRESENT_COLS) {
    const id_col = df[ID_COL].data;
    const exemption_col = df[EXEMPTION_COL].data;
    const present_cols = present_colnames.map(c => df[c].data);

    const name_col = df[NAME_COL].data;
    const group_col = df[GROUP_COL].data;
    const absent_col = df[ABSENT_COL].data;

    const stats = {VD: 0, NVD: 0, VR: 0};
    const result = {};
    const warnings = [];
    for (let r of df.index) {
        const id = id_col[r];
        const name = name_col[r];
        const group = group_col[r] || '';
        const sessions_absent = absent_col[r] || 0;
        const exemption = exemption_col[r] == EXEMPTION_TRUE_VALUE;
        const present_vals = present_cols.map(col => col[r]);
        let sessions_present = 0;
        for (let val of present_vals) {
            if (val) {
                sessions_present += val;
            }
        }
        let status = 'NVD';
        if (exemption) {
            status = 'VR';
        }
        else if (sessions_present >= minimum_attendance) {
            status = 'VD';
        }
        const record = {id, name, group, exemption, sessions_present, sessions_absent, status};
        
        if (result[id]) {
            // TODO: consider automerging duplicate entries?
            warnings.push(`Student ID ${id} occurs multiple times in the data. Be aware that all entries after the first are discarded.`);
        }
        else {
            result[id] = record;
        }
        stats[status] += 1;
    }
    return {result, warnings, stats};
}

export { STATUS_DESCRIPTIONS, academyAttendanceBookToFrame, academyAttendanceSheetToFrame, determineCommonSessionCount, determineAttendanceStatus };