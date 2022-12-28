<template>
  <div style="display:flex; justify-content: center;">
    <v-stepper v-model="step" non-linear style="width: 100%; max-width: 60em;">
      <v-stepper-header>
        <v-stepper-step editable step="1" :complete="step > 1" >Introduction</v-stepper-step>
        <v-divider />      
        <v-stepper-step editable step="2" :complete="step > 2" >Load Data</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="3" :complete="step > 3" >Define Output Columns</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="4" >Obtain Results</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card>
            <v-card-title>Combine Results</v-card-title>
            <v-card-text>
              <p>Combine student results from different sources into a single spreadsheet.</p>
              <p>This tool can be used to combine results from custom spreadsheets, Ans, Canvas
                 and previous SPD spreadsheets. Columns from different files can be selected
                 to construct a spreadsheet with one row per student, and selected columns
                 from various sources</p>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>                        
            </v-card-actions>
          </v-card>
        </v-stepper-content>
        <v-stepper-content step="2">
          <v-card>
            <v-card-title>Input Spreadsheets</v-card-title>
            <v-card-text>
              <h3>Choose an import format</h3>
              <p>Click one of the import formats to import data from different sources</p>
              <v-tabs v-model="inputTab" background-color="primary">
                <v-tabs-slider />
                <v-tab>Regular/Ans</v-tab>
                <v-tab>Canvas</v-tab>
                <v-tab>SPD</v-tab>
                <v-tab>Attendance</v-tab>
              </v-tabs>
              <v-tabs-items v-model="inputTab">
                <v-tab-item>
                  <h3>Ans Export or Regular Spreadsheet</h3>
                  <p>This option can be used to import results from Ans (exported as "Excel EN")
                    or standard Excel workbooks or csv files.
                  </p>
                  <FileDropZone accept=".xlsx,.csv" :autoSubmit="true" @change="fileChosen" />
                </v-tab-item>
                <v-tab-item>
                  <h3>Canvas CSV Files</h3>
                  <p>This option can be used to import a CSV file exported from the Canvas gradebook.</p>
                  <FileDropZone accept=".csv" :autoSubmit="true" @change="canvasFileChosen" />                  
                </v-tab-item>
                <v-tab-item>
                  <h3>SPD Excel Files</h3>
                  <p>This option can be used to import results from an SPD file with existing course results.</p>
                  <FileDropZone accept=".xlsx" :autoSubmit="true" @change="spdFileChosen" />                  
                </v-tab-item>
                <v-tab-item>
                  <h3>Attendance Data</h3>
                  <p>This option can be used to import attendance data exported from sin-online</p>
                  <AttendancePanel v-model="attendance" />                  
                </v-tab-item>                                                
              </v-tabs-items>
              <div v-for="book in workbooks" :key="book.filename">
                  <h3>{{book.filename}}</h3>
                  <v-card v-for="frame in book.frames" :key="frame.sheetName">
                    <v-card-title>{{frame.sheetName}}</v-card-title>
                    <v-card-actions>
                      <v-switch label="Add all students to output" v-model="frame.includeStudents" />
                    </v-card-actions>
                  </v-card>
                  <v-alert v-if="book.skipped.length > 0" type="warning">
                    {{book.skipped.length}} sheets were skipped
                  </v-alert>
                </div>
            </v-card-text>
            <v-card-actions>

              <v-btn color="primary" @click="step--">Previous</v-btn>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>                        
            </v-card-actions>
          </v-card>
        </v-stepper-content>
        <v-stepper-content step="3">
          <v-card>
            <v-card-title>Output Spreadsheet</v-card-title>
            <v-card-text>
              <v-card v-if="this.availableKeys.length > 0">
                <v-card-title>Output Columns</v-card-title>
                <v-card-text>
                  <v-container dense class="colContainer">
                    <v-row class="outputCols" dense>            
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
                  </v-card-text>
                </v-card>   
              <br />
              <v-btn color="primary" :disabled="availableKeys.length == 0" @click="addOutputCol">Add Output Column</v-btn>              
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="step--">Previous</v-btn>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>
        <v-stepper-content step="4">
          <v-card>
            <v-card-title>
              Output Spreadsheet
            </v-card-title>
            <v-card-text>
                <p>Use the following option if you want to remove students who have no results in any of the output columns</p>
                <v-switch label="Remove students without any results" v-model="dropEmptyStudents" />
                <p>Use these option if you want to conditionally remove certain students from the output.</p>
                <v-switch v-model="addFilter" :label="filterLabel" />
                <ConditionPanel v-show="addFilter" :availableColumns="availableColumns" :availableKeys="availableKeys" 
                                @input="updateFilter"/>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="step--">Previous</v-btn>
              <v-spacer /><v-btn color="primary" :disabled="cantExport" @click="exportSheet">Export Spreadsheet</v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script>
  import XLSX from 'xlsx';
  import {processWorkbook, processCanvasWorkbook, processSpdWorkbook} from '../util/processWorkbook';
  import exportColumns from '../util/exportColumns';
  import AttendancePanel from './AttendancePanel';
  import FileDropZone from './FileDropZone.vue';
  import SelectColumn from './SelectColumn';
  import ConditionPanel from './ConditionPanel';
  import GradingPolicy from '../util/GradingPolicy';


  
  export default {
    name: 'Combiner',
    components: {
      AttendancePanel, SelectColumn, ConditionPanel, FileDropZone
    },
    data: () => ({
      workbooks: [],
      keyColumn: 'student number', // TODO: this is not very nice
      outputColumns: [],
      dropEmptyStudents: true,
      attendance: null,
      addFilter: false,
      currentFilter: {},
      step: 1,
      inputTab: 0
    }),
    methods: {
      // clickOpen() {
      //   this.$refs.openFileInput.click();
      // },
      // clickOpenCanvas() {
      //   this.$refs.openCanvasInput.click();
      // },      
      // clickOpenSpd() {
      //   this.$refs.openSpdInput.click();
      // },            
      fileChosen(files) {
        if (files[0]) {
          const file = files[0];
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
      canvasFileChosen(files) {
        if (files[0]) {
          const file = files[0];
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
      spdFileChosen(files) {
        if (files[0]) {
          const file = files[0];
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
        // TODO: this is of course an ugly hack!
        if (keys.has('student number')) {
          return ['student number'];
        }

        return [];
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