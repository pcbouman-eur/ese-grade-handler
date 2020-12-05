<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="6">
        <h2>Combine Results</h2>
        <p>Combine student results from different input datasets into a single output dataset.
           You can toggle whether the students from a dataset should be added to the output.
           If you have a file with results from last year, you can disable adding students from
           last year to the set of output students. In that case, the results from last year's
           students  are only included if their identities also appear in a dataset from this
           year (where the toggle is active).
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <h4>Input Spreadsheets</h4>
        <v-btn color="primary" @click="clickOpen">Add Spreadsheet</v-btn>
        <input type="file" style="display: none" ref="openFileInput"
                accept=".xlsx" @change="fileChosen" />
        <br />
        <div v-for="book in workbooks" :key="book.filename">
          <h3>{{book.filename}}</h3>
          <v-card v-for="frame in book.frames" :key="frame.sheetName">
            <v-card-title>{{frame.sheetName}}</v-card-title>
            <!-- <v-card-text v-if="frame.keys.length == 1">
              Key column: {{frame.keys[0].column}} ({{frame.keys[0].type}})
            </v-card-text>
            <v-card-text v-else>
              Multiple columns with identities found, this is currently not supported.
            </v-card-text> -->
            <v-card-actions>
              <v-switch label="Add all students to output" v-model="frame.includeStudents" />
            </v-card-actions>
          </v-card>
          <v-alert v-if="book.skipped.length > 0" type="warning">
            {{book.skipped.length}} sheets were skipped
          </v-alert>
        </div>
      </v-col>
      <v-col cols=6>
        <h4>Output Spreadsheet</h4>
        <v-btn color="primary" :disabled="availableKeys.length == 0" @click="addOutputCol">Add Output Column</v-btn>
        &nbsp;
        <v-btn color="primary" :disabled="cantExport" @click="exportSheet">Export Spreadsheet</v-btn>
        <br />
        <v-switch label="Remove students without any results" v-model="dropEmptyStudents" />
        <div v-if="this.availableKeys.length > 0">
          <h4>Key Column</h4>
          <v-select :items="availableKeys"
                    v-model="keyColumn"
                    label="Key type"
                    outlined
                    dense />
        </div>
        <div v-for="(col, idx) in outputColumns" :key="'output-'+idx">            
          <h4>Output Column {{idx+1}}</h4>
          <v-container class="dense">
            <v-row>
              <v-col cols="6" class="dense">
                <v-select
                  :items="availableColumns"
                  :item-text="availableColumnToText"
                  :item-value="availableColumnToValue"
                  :value="col.outputColumn"
                  @change="v => updateSourceColumn(v, col)"
                  label="Source Column"
                  outlined
                  dense />
              </v-col>
              <v-col cols="6" class="dense">
                <v-text-field label="Output Column Name"
                              v-model="col.outputName"
                              outlined
                              dense />
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import XLSX from 'xlsx';
  import processWorkbook from '../util/processWorkbook';
  import exportColumns from '../util/exportColumns';
  
  export default {
    name: 'Combiner',

    data: () => ({
      workbooks: [],
      keyColumn: undefined,
      outputColumns: [],
      dropEmptyStudents: true
    }),
    methods: {
      clickOpen() {
        this.$refs.openFileInput.click();
      },
      fileChosen(ev) {
        if (ev.target.files[0]) {
          const file = ev.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev2) => {
            const data = new Uint8Array(ev2.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const process = processWorkbook(workbook);
            const wb = {filename: file.name, workbook, ...process};
            wb.frames.forEach(frame => frame.includeStudents = true);
            this.workbooks.push(wb);
          };
          reader.readAsArrayBuffer(file);
        }
      },
      availableColumnToText(c) {
        //console.log(c);
        if (c.wb && c.wb.filename) {
          return c.wb.filename + ' / ' + c.frame.sheetName + ' / ' + c.column;
        }
        else if (c.frame && c.frame.sheetName && c.column) {
          return 'Unknown Workbook / ' + c.frame.sheetName + ' / ' + c.column;
        }
        else if (c.column) {
          return 'Unknown Workbook / Unknown Sheet / ' + c.column;
        }
        return '[ERROR - Unknown Column]';
      },
      availableColumnToValue(c) {
        return {index: c.index, column: c.column};
      },
      addOutputCol() {
        this.outputColumns.push(
          {
             outputKey: this.availableKeys[0],
             outputColumn: this.availableColumns[0],
             outputName: this.availableColumns[0].column
          }
        );
      },
      updateSourceColumn(newVal, col) {
        col.outputColumn = newVal;
        col.outputName = newVal.column;
      },
      exportSheet() {
        const table = exportColumns.makeTable(this.keyColumn, this.allKeys, this.selectedColumns, this.dropEmptyStudents);
        const wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(table);
        XLSX.utils.book_append_sheet(wb, ws, 'Output');
        XLSX.writeFile(wb, 'output.xlsx');
      }
    },
    computed: {
      availableColumns() {
        const result = [];
        let idx = 0;
        for (let wb of this.workbooks) {
          for (let frame of wb.frames) {
            for (let column of frame.df.columns) {
              result.push({wb, frame, column, index: idx++})
            }
          }
        }
        return result;
      },
      availableKeys() {
        const keys = new Set();
        for (let wb of this.workbooks) {
          for (let frame of wb.frames) {
            for (const key of Object.values(frame.keys)) {
              keys.add(key.type);
            }
          }
        }
        return Array.from(keys).sort();
      },
      allKeys() {
        let keys = new Set();
        for (let wb of this.workbooks) {
          for (let frame of wb.frames) {
            if (frame.includeStudents && this.keyColumn && frame.keys[this.keyColumn]) {
              const kc = frame.keys[this.keyColumn];
              for (let key of kc.keys) {
                keys.add(key);
              }
            }
          }  
        }
        keys = Array.from(keys).sort();
        return keys;
      },
      selectedColumns() {
        const result = [];
        for (let oc of this.outputColumns) {
          console.log(oc);
          const colIndex = oc.outputColumn.index;
          const col = this.availableColumns[colIndex];
          const name = oc.outputName;
          result.push({name, data: col});
        }
        return result;
      },
      cantExport() {
        return !this.keyColumn || this.outputColumns.length == 0;
      }
    },
    watch: {
      availableKeys() {
        if (!this.keyColumn && this.availableKeys.length > 0) {
          this.keyColumn = this.availableKeys[0];
        }
      }
    }
  }
</script>

<style scoped>
.outputCol {
  padding: 1em;
}
.dense {
  margin: 0;
  padding: 0;
}
</style>