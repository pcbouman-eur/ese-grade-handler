/**
 * Minimal DataFrame replacement for the subset of danfojs API used in this project.
 * Supports: constructor with data+columns, column access with .data, .columns, .index, and .query().
 */
class DataFrame {
    constructor(data, { columns }) {
        this._data = data;
        this.columns = columns;
        this.index = data.map((_, i) => i);
        this._buildColumnAccessors();
    }

    get shape() {
        return [this._data.length, this.columns.length];
    }

    get rows() {
        return this._data;
    }

    _buildColumnAccessors() {        for (let i = 0; i < this.columns.length; i++) {
            const col = this.columns[i];
            this[col] = { data: this._data.map(row => row[i]) };
        }
    }

    query({ column, is, to, inplace }) {
        const colIdx = this.columns.indexOf(column);
        let filtered;
        if (is === '>') {
            filtered = this._data.filter(row => row[colIdx] > to);
        } else if (is === '<') {
            filtered = this._data.filter(row => row[colIdx] < to);
        } else if (is === '==') {
            filtered = this._data.filter(row => row[colIdx] == to);
        } else if (is === '!=') {
            filtered = this._data.filter(row => row[colIdx] != to);
        } else {
            filtered = this._data.slice();
        }
        if (inplace) {
            this._data = filtered;
            this.index = filtered.map((_, i) => i);
            this._buildColumnAccessors();
        } else {
            return new DataFrame(filtered, { columns: this.columns });
        }
    }
}

export { DataFrame };
