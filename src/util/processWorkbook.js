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
            console.log(err);
        }
        if (error) {
            skipped.push({sheetName, error});
            console.log({sheetName, error});
        }
    }
    return {frames, skipped};
}

const CANVAS_SIS_COL = 'SIS User ID';

function processCanvasWorkbook(workbook) {
    const frames = [], skipped = [];
    if (workbook.SheetNames && workbook.SheetNames.length == 1) {
        let error = 'No suitable key column found';
        try {
            const df = sheetToDataframe(workbook.Sheets[workbook.SheetNames[0]], 1, 3);
            // Kind of weird way to get rid of NaN users (like Test Students)
            df.query({column: CANVAS_SIS_COL, is: '>', to: '', inplace: true});
            const keys = findKeyColumns(df);
            if (Object.keys(keys).length > 0) {
                frames.push({sheetName: 'Canvas Grades', df, keys});
                error = undefined;
            }
        }
        catch (err) {
            console.log(err);
            error = 'Sheet has invalid structure';
        }
        if (error) {
            skipped.push({sheetName: 'Canvas Grades', error});
        }
    }
    else {
        skipped.push({sheetName: 'All', error: 'Unexpected structure in sheet'});
    }
    return {frames, skipped};
}

const USER_PATTERN = /(user|student|erna)/i;
const USER_PATTERN_HELP = "a column named either 'user', 'student' or 'erna'"
const SHEET_KEY = 'Attendance';
const EXEMPTION_PATTERN = /(vrijstelling|exemption)/i;
const EXEMPTION_PATTERN_HELP = "a column named 'vrijstelling' or 'exemption'";
const SESSION_PATTERN = /(s|sessie|session)[_ ]*(\d+)/i;
const FIRST_ROW = 6;
const DEFAULT_MINIMUM_PERCENTAGE = 0.7;

function findColumnByPattern(df, pat) {
    for (const col of df.columns.values()) {
        if (col.match(pat)) {
            return col;
        }
    }
    return null;
}

function processAttendanceWorkbook(workbook) {
    const attSheet = workbook.Sheets[SHEET_KEY];
    if (!attSheet) {
        return {error: 'No sheet found with key '+SHEET_KEY};
    }
    const df = sheetToDataframe(attSheet,FIRST_ROW,FIRST_ROW+1);

    const USER_KEY = findColumnByPattern(df, USER_PATTERN);
    const EXEMPTION_KEY = findColumnByPattern(df, EXEMPTION_PATTERN);
    
    if (!USER_KEY) {
        return {error: 'No user column found. Expected '+USER_PATTERN_HELP};
    }
    if (!EXEMPTION_KEY) {
        return {error: 'No exemption column found. Expected '+EXEMPTION_PATTERN_HELP};
    }

    const userCol = df[USER_KEY].data;
    const exemptionCol = df[EXEMPTION_KEY].data;

    let sessionKeys = [];
    let sessionCols = {};
    for (let col of df.columns) {
        if (col.match(SESSION_PATTERN)) {
            sessionKeys.push(col);
            sessionCols[col] = df[col].data;
        }
    }

    const data = {};

    const duplicates = [];

    for (let row of df.index) {
        const userName = userCol[row];
        let exemption = exemptionCol[row];
        const sessionsPresent = new Set();
        for (let ses of sessionKeys) {
            const present = sessionCols[ses][row];
            if (present) {
                sessionsPresent.add(ses);
            }
        }
        if (data[userName]) {
            duplicates.push(userName);
            const oldrec = data[userName];
            exemption = exemption || oldrec.exemption;
            for (let ses of oldrec.sessionsPresent) {
                sessionsPresent.add(ses);
            }
        }
        data[userName] = {userName, exemption, sessionsPresent};
    }

    const threshold = Math.ceil(DEFAULT_MINIMUM_PERCENTAGE * sessionKeys.length);
    return {sessions: sessionKeys, data, duplicates, threshold};
}

export {processWorkbook, processCanvasWorkbook, processAttendanceWorkbook};
