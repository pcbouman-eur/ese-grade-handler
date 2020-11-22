<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="6">
        <h2>Combine Results</h2>
        <p>Combine different results</p>
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
            <v-card-text v-if="frame.keys.length == 1">
              Key column: {{frame.keys[0].column}} ({{frame.keys[0].type}})
            </v-card-text>
            <v-card-text v-else>
              Multiple columns with identities found, this is currently not supported.
            </v-card-text>
          </v-card>
          <v-alert v-if="book.skipped" type="warning">
            {{book.skipped.length}} sheets were skipped
          </v-alert>
        </div>
      </v-col>
      <v-col cols=6>
        <h4>Output Spreadsheet</h4>
        <v-btn color="primary" :disabled="availableKeys.length == 0" @click="addOutputCol">Add Output Column</v-btn>
        <v-btn color="primary" :disabled="cantExport" @click="exportSheet">Export Spreadsheet</v-btn>
        <v-list>
          <v-list-item v-if="this.availableKeys.length > 0">
            <v-select :items="availableKeys"
                      v-model="keyColumn"
                      label="Key type"
                      outlined />
          </v-list-item>
          <v-list-item class="outputCol" v-for="(col, idx) in outputColumns" :key="'output-'+idx">            
            <v-select
                      :items="availableColumns"
                      :item-text="c => c.wb.filename + ' / ' + c.frame.sheetName + ' / ' + c.column"
                      :item-value="c => c.index"
                      v-model="col.outputColumn"
                      label="Column"
                      outlined />
          </v-list-item>
        </v-list>
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
            this.workbooks.push(wb);
          };
          reader.readAsArrayBuffer(file);
        }
      },
      addOutputCol() {
        this.outputColumns.push(
          {
             outputKey: this.availableKeys[0],
             outputColumn: this.availableColumns[0]
          }
        );
      },
      exportSheet() {
        const table = exportColumns(this.keyColumn, this.allKeys, this.selectedColumns);
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
            if (this.keyColumn && frame.keys[this.keyColumn]) {
              const kc = frame.keys[this.keyColumn];
              for (let key of kc.keys) {
                keys.add(key);
              }
            }
          }  
        }
        keys = Array.from(keys).sort();
        console.log(keys);
        return keys;
      },
      selectedColumns() {
        const result = [];
        for (let oc of this.outputColumns) {
          const colIndex = oc.outputColumn;
          const col = this.availableColumns[colIndex];
          result.push(col);
        }
        return result;
      },
      cantExport() {
        return !this.keyColumn && this.outputColumns.length == 0;
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
</style>