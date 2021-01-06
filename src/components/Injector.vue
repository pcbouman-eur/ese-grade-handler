<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="6">
        <h2>Inject Results</h2>
        <p>Read final course results from one dataset and inject those results
           into the official SPD spreadsheet to be loaded into Osiris.
           The free version of SheetJS strips the styling and layout from the
           output spreadsheet. I am not sure if that is a problem for SPD,
           but it is easy to copy paste the results in the official sheet to
           work around this.
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <h4>Input Spreadsheets (Course Results)</h4>
        <v-btn color="primary" @click="clickOpen">Select Source Spreadsheet</v-btn>
        <input type="file" style="display: none" ref="openFileInput"
                accept=".xlsx" @change="fileChosen" />

        <br />
        <v-card v-if="sourceBook">
          <v-card-title>{{sourceBook.filename}}</v-card-title>
          <v-card-text>
            <h5>The following sheets were found</h5>
            <v-list-item v-for="frame in sourceBook.frames" :key="frame.sheetName">
              <v-list-item-content>{{frame.sheetName}}</v-list-item-content>
            </v-list-item>
            <v-alert v-if="sourceBook.skipped.length > 0" type="warning">
              {{sourceBook.skipped.length}} sheets were skipped
            </v-alert>              
          </v-card-text>
        </v-card>
        <AttendancePanel v-model="attendance" />
      </v-col>
      <v-col cols=6>
        <h4>Target Spreadsheet (as provided by SPD)</h4>
        <v-btn color="primary" @click="clickOpenTarget">Set Target Spreadsheet</v-btn>
        &nbsp;
        <v-btn color="primary" @click="downloadResult" :disabled="!injectionResults">
          Export Results</v-btn>
        &nbsp;
        <v-btn color="primary" @click="downloadMissing" :disabled="!injectionResults || injectionResults.missing.length == 0">
          Export Missing</v-btn>          
        <input type="file" style="display: none" ref="openFileTarget"
                accept=".xlsx" @change="fileTargetChosen" />
        <v-switch label="Invalid result for students with insufficient attendance" v-if="attendance" v-model="useAttendance" />
        
        <h5 v-if="targetFilename">Target Spreadsheet: {{targetFilename}}</h5>
        <h5 v-else>Target Spreadsheet: not set</h5>
        <v-select
          class="margin-top"
          :disabled="availableColumns.length == 0"
          :items="availableColumns"
          :item-text="availableColumnToText"
          :item-value="availableColumnToValue"
          v-model="sourceColumn"
          label="Source Column"
          outlined />
        <v-alert v-if="injectionResults && injectionResults.missing.length > 0" type="warning">
          There are {{injectionResults.missing.length}} students who were missing
          in the injection target.
        </v-alert>
        <template v-if="injectionResults && injectionResults.errors.length > 0">
          <br />
          <v-alert type="error">
            There were {{injectionResults.errors.length}} errors while injecting results.
          </v-alert>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                View Errors 
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <ul>
                  <li v-for="(err,idx) in injectionResults.errors" :key="'error-'+idx">
                    {{err}}
                  </li>
                </ul>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
        <template v-if="injectionResults && injectionResults.warnings.length > 0">
          <br />
          <v-alert type="warning">
            There were {{injectionResults.warnings.length}} warnings while injecting results.
          </v-alert>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                View Warnings
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <ul>
                  <li v-for="(warning,idx) in injectionResults.warnings" :key="'warning-'+idx">
                    {{warning}}
                  </li>
                </ul>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import XLSX from 'xlsx';
  import {processWorkbook} from '../util/processWorkbook';
  import GradingPolicy from '../util/GradingPolicy';
  import IdentityConfig from '../util/IdentityConfig';
  import injectResults from '../util/injectResults';
  import AttendancePanel from './AttendancePanel';

  export default {
    name: 'Injector',
    components: {
      AttendancePanel
    },
    data: () => ({
      attendance: null,
      useAttendance: true,
      sourceBook: null,
      sourceColumn: null,
      rawTarget: null,
      targetFilename: null,
      dropEmptyStudents: false
    }),
    methods: {
      clickOpen() {
        this.$refs.openFileInput.click();
      },
      clickOpenTarget() {
        this.$refs.openFileTarget.click();
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
            this.sourceBook = wb;
          };
          reader.readAsArrayBuffer(file);
        }
      },
      fileTargetChosen(ev) {
        if (ev.target.files[0]) {
          this.rawTarget = null;
          this.target = null;
          const file = ev.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev2) => {
            this.rawTarget = new Uint8Array(ev2.target.result);
            this.targetFilename = file.name;
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
      downloadResult() {
        if (this.injectionResults && this.injectionResults.wb) {
          const fname = this.targetFilename.replace('.xlsx','-injected.xlsx');
          XLSX.writeFile(this.injectionResults.wb, fname);
        }
      },
      downloadMissing() {
        if (this.injectionResults && this.injectionResults.missing.length > 0) {
          const table = [['Student','Result']];
          for (let entry of this.injectionResults.missing) {
            table.push([entry.id, entry.result]);
          }
          const fname = this.targetFilename.replace('.xlsx','-missing.xlsx');
          const wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(table);
          XLSX.utils.book_append_sheet(wb, ws, 'Missing');
          XLSX.writeFile(wb, fname);
        }
      }
    },
    computed: {
      injectionResults() {
        if (this.rawTarget && this.selectedColumn) {
            try {
              const wb = XLSX.read(this.rawTarget, {type: 'array', cellStyles:true});
              const passAtt = this.attendance && this.useAttendance ? this.attendance : null;
              const result = injectResults(this.selectedColumn, wb, GradingPolicy, IdentityConfig, passAtt);
              return result;
            }
            catch (err) {
              return {errors: ['Error while processing target spreadsheet: ' + err.message]};
            }
        }
        return null;
      },
      availableColumns() {
        const result = [];
        let idx = 0;
        if (this.sourceBook) {
          for (let frame of this.sourceBook.frames) {
            for (let column of frame.df.columns) {
              result.push({wb: this.sourceBook, frame, column, index: idx++, type: 'df'})
            }
          }
        }
        return result;
      },
      allKeys() {
        let keys = new Set();
        if (this.sourceBook) {
          for (let frame of this.sourceBook.frames) {
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
      selectedColumn() {
        if (this.sourceColumn) {
          const colIndex = this.sourceColumn.index;
          const col = this.availableColumns[colIndex];
          return col;
        }
        return null;
      },
    },
  }
</script>

<style scoped>
.margin-top {
  margin-top: 1em;
}
</style>