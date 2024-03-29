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
        <v-btn color="primary" @click="clickOpen" class="addBtn">Add Spreadsheet</v-btn>
        <v-btn color="primary" @click="clickOpenCanvas" class="addBtn">Add Canvas Grades</v-btn>
        <v-btn color="primary" @click="clickOpenSpd" class="addBtn">Add SPD Grades</v-btn>
        <input type="file" style="display: none" ref="openFileInput"
                accept=".xlsx,.csv" @change="fileChosen" />
        <input type="file" style="display: none" ref="openCanvasInput"
                accept=".csv" @change="canvasFileChosen" />                
        <input type="file" style="display: none" ref="openSpdInput"
                accept=".xlsx" @change="spdFileChosen" />                                
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
        <AttendancePanel v-model="attendance" />
      </v-col>
      <v-col cols=6>
        <h4>Output Spreadsheet</h4>
        <v-btn color="primary" :disabled="availableKeys.length == 0" @click="addOutputCol">Add Output Column</v-btn>
        &nbsp;
        <v-btn color="primary" :disabled="cantExport" @click="exportSheet">Export Spreadsheet</v-btn>
        <br />
        <v-switch label="Remove students without any results" v-model="dropEmptyStudents" />

        <v-card v-if="this.availableKeys.length > 0">
          <v-container dense class="colContainer">
            <v-row class="outputCols" dense>            
          <!-- <h4>Output Column  <v-chip x-small color="danger">delete</v-chip></h4> -->
              <v-col cols="1" class="dense">
                <div>Key</div>
              </v-col>
              <v-col cols="11" class="dense">
                <v-select :items="availableKeys"
                    v-model="keyColumn"
                    label="Key type"
                    outlined
                    dense />
              </v-col>
            </v-row>            
            <v-row v-for="(col, idx) in outputColumns" :key="'output-'+idx" class="outputCols" dense>            
          <!-- <h4>Output Column  <v-chip x-small color="danger">delete</v-chip></h4> -->
              <v-col cols="1" class="dense">
                <div>Col {{idx+1}}.</div>
              </v-col>
              <v-col cols="6" class="dense">
                  <SelectColumn v-model="outputColumns[idx]" label="Source Column"
                                :availableColumns="availableColumns"
                                :availableKeys="availableKeys" />
              </v-col>
              <v-col cols="4" class="dense">
                <v-text-field label="Output Column Name"
                              v-model="col.outputName"
                              outlined
                              dense />
              </v-col>
              <v-col cols="1" class="dense">
                <v-btn @click="moveColumn(idx, false)" :disabled="idx >= outputColumns.length-1" x-small icon color="primary"><v-icon>mdi-arrow-down</v-icon></v-btn>
                <v-btn @click="moveColumn(idx, true)"  :disabled="idx == 0" x-small icon color="primary"><v-icon>mdi-arrow-up</v-icon></v-btn>
                <v-btn @click="deleteColumn(idx)" x-small icon color="error"><v-icon>mdi-delete</v-icon></v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
        <div v-if="this.availableColumns.length > 0">
          <h4>Filter Students</h4>
          <v-switch v-model="addFilter" :label="filterLabel" />
          <ConditionPanel v-show="addFilter" :availableColumns="availableColumns" :availableKeys="availableKeys" 
                          @input="updateFilter"/>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import XLSX from 'xlsx';
  import {processWorkbook, processCanvasWorkbook, processSpdWorkbook} from '../util/processWorkbook';
  import exportColumns from '../util/exportColumns';
  import AttendancePanel from './AttendancePanel';
  import SelectColumn from './SelectColumn';
  import ConditionPanel from './ConditionPanel';
  import GradingPolicy from '../util/GradingPolicy';


  
  export default {
    name: 'Combiner',
    components: {
      AttendancePanel, SelectColumn, ConditionPanel
    },
    data: () => ({
      workbooks: [],
      keyColumn: undefined,
      outputColumns: [],
      dropEmptyStudents: true,
      attendance: null,
      addFilter: false,
      currentFilter: {}
    }),
    methods: {
      clickOpen() {
        this.$refs.openFileInput.click();
      },
      clickOpenCanvas() {
        this.$refs.openCanvasInput.click();
      },      
      clickOpenSpd() {
        this.$refs.openSpdInput.click();
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
      canvasFileChosen(ev) {
        if (ev.target.files[0]) {
          const file = ev.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev2) => {
            const data = new Uint8Array(ev2.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const process = processCanvasWorkbook(workbook);
            const wb = {filename: file.name, workbook, ...process};
            wb.frames.forEach(frame => frame.includeStudents = true);
            this.workbooks.push(wb);
          };
          reader.readAsArrayBuffer(file);
        }
      },      
      spdFileChosen(ev) {
        if (ev.target.files[0]) {
          const file = ev.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev2) => {
            const data = new Uint8Array(ev2.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const process = processSpdWorkbook(workbook);
            const wb = {filename: file.name, workbook, ...process};
            console.log(wb);
            wb.frames.forEach(frame => frame.includeStudents = false);
            this.workbooks.push(wb);
          };
          reader.readAsArrayBuffer(file);
        }
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
      exportSheet() {
        const table = exportColumns.makeTable(this.keyColumn, this.allKeys, this.selectedColumns,
           this.dropEmptyStudents, this.activeFilter, GradingPolicy);
        const wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(table);
        XLSX.utils.book_append_sheet(wb, ws, 'Output');
        XLSX.writeFile(wb, 'output.xlsx');
      },
      updateFilter(val) {
        this.currentFilter = val;
      },
      deleteColumn(idx) {
        this.outputColumns.splice(idx, 1);
      },
      moveColumn(idx, up) {
        if (up) {
          const elems = [this.outputColumns[idx], this.outputColumns[idx-1]];
          this.outputColumns.splice(idx -1, 2, ...elems);
        }
        else {
          const elems = [this.outputColumns[idx+1], this.outputColumns[idx]];
          this.outputColumns.splice(idx, 2, ...elems);
        }
      }
    },
    computed: {
      activeFilter() {
        if (this.addFilter) {
          return this.currentFilter;
        }
        return null;
      },
      availableColumns() {
        const result = [];
        let idx = 0;
        for (let wb of this.workbooks) {
          for (let frame of wb.frames) {
            for (let column of frame.df.columns) {
              result.push({type: 'df', wb, frame, column, index: idx++})
            }
          }
        }
        if (this.attendance) {
          result.push({type: 'attendance-bool', column: 'Attendance',index: idx++, data: this.attendance});
          result.push({type: 'attendance-cat', column: 'Attendance Status',index: idx++, data: this.attendance});
          result.push({type: 'attendance-count', column: 'Attendance Count',index: idx++, data: this.attendance});
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
          const colIndex = oc.outputColumn.index;
          const col = this.availableColumns[colIndex];
          const name = oc.outputName;
          result.push({name, data: col, finalResult: col.finalResult});
        }
        return result;
      },
      cantExport() {
        return !this.keyColumn || this.outputColumns.length == 0;
      },
      filterLabel() {
        if (this.addFilter) {
          return 'Only students where the following condition holds are included:';
        }
        return 'All students are included';
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

.outputCols {
  padding-left: 1em;
  padding-right: 1em;
}

.colContainer {
  padding-left: 1em;
  padding-right: 1em;
  
}

.colContainer:first-child {
  padding-top: 1em;
}

.addBtn:not(:first-child) {
  margin-left: 0.5em;
}
</style>