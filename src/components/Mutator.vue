<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="6">
        <h2>Mutate Results</h2>
        <p>If course results have been established, this workflow can compare
          the submitted grades to a spreadsheet with updated course results.
          The output is an SPD spreadsheet which only contains the results
          that have changed. If you already made mutations before, it is also
          possible to add some of these mutation spreadsheets submitted to SPD.
          This way, the output spreadsheet generated only contains the course
          results that must be mutated by SPD.
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-card>
        <v-card-title>Input Spreadsheet: (Updated) Course Results</v-card-title>
        <v-card-text>
          <v-btn color="primary" @click="clickOpen">Select Source Spreadsheet</v-btn>
          <input type="file" style="display: none" ref="openFileInput"
                  accept=".xlsx" @change="fileChosen" />
          &nbsp;
          <AttendancePanel v-model="attendance" />
        </v-card-text>
        </v-card>
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
        <v-card>
          <v-card-title>Injection Target Spreadsheet (provided by/submitted to SPD)</v-card-title>
          <v-card-text>
            <v-card flat>
              <v-card v-if="targetData" flat>
                <v-card-title>Injection Target: {{targetData.name}}</v-card-title>
                <v-card-subtitle>Date: {{targetData.date}}, <br /> Entries: {{Object.keys(targetData.data.entries).length}}</v-card-subtitle>
              </v-card>              
           <v-alert v-else type="warning">Injection Target spreadsheet not set</v-alert>
          </v-card>
          <template v-for="(mut,mutIdx) in mutations">
            <v-card :key="'mut-'+mutIdx" flat>
              <v-card-title>Mutation {{mutIdx + 1}} - {{mut.name}}</v-card-title>
              <v-card-subtitle>Date: {{mut.date}}, <br />Entries: {{Object.keys(mut.data.entries).length}}</v-card-subtitle>
            </v-card>
          </template>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="clickOpenTarget">Set Target Spreadsheet</v-btn>
            &nbsp;
            <v-btn color="primary" @click="clickAddMutation">Add Mutations</v-btn>
          </v-card-actions>
        </v-card>
        
        <input type="file" style="display: none" ref="addMutations"
                accept=".xlsx" @change="addMutationsChosen" />
      </v-col>
      <v-col cols=6>
        <v-btn color="primary" @click="downloadResult" :disabled="!injectionResults">
          Export Results</v-btn>
        &nbsp;
        <v-btn color="primary" @click="downloadMissing" :disabled="!injectionResults || injectionResults.missing.length == 0">
          Export Missing</v-btn>          
        <input type="file" style="display: none" ref="openFileTarget"
                accept=".xlsx" @change="fileTargetChosen" />
        <v-switch label="Invalid result for students with insufficient attendance" v-if="attendance" v-model="useAttendance" />
        
        <v-card v-if="updatedResults">
          <v-card-text>
            {{updatedResults.data}}
          </v-card-text>
        </v-card>

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
  import {readResultEntries, processResult, mutateResults} from '../util/injectResults';
  import AttendancePanel from './AttendancePanel';

  export default {
    name: 'Mutator',
    components: {
      AttendancePanel
    },
    data: () => ({
      attendance: null,
      useAttendance: true,
      sourceBook: null,
      sourceColumn: null,
      rawTarget: null,
      targetData: null,
      mutations: [],
      dropEmptyStudents: false
    }),
    methods: {
      clickOpen() {
        this.$refs.openFileInput.click();
      },
      clickOpenTarget() {
        this.$refs.openFileTarget.click();
      },
      clickAddMutation() {
        this.$refs.addMutations.click();
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
            const workbook = XLSX.read(this.rawTarget, {type: 'array'});
            const res = readResultEntries(workbook);
            const data = {name: file.name,
                          lastModified: file.lastModified,
                          date: new Date(file.lastModified),
                          data: res};
            this.targetData = data;
          };
          reader.readAsArrayBuffer(file);
        }
      },
       addMutationsChosen(ev) {
        if (ev.target.files[0]) {
          const file = ev.target.files[0];
          console.log(file);
          const reader = new FileReader();
          reader.onload = (ev2) => {
            const data = new Uint8Array(ev2.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const res = readResultEntries(workbook);
            const mutation = {name: file.name,
                              lastModified: file.lastModified,
                              date: new Date(file.lastModified),
                              data: res};
            this.mutations.push(mutation);
          };
          reader.readAsArrayBuffer(file);
        }
        // if (ev.target.files[0]) {
        //   this.rawTarget = null;
        //   this.target = null;
        //   const file = ev.target.files[0];
        //   const reader = new FileReader();
        //   reader.onload = (ev2) => {
        //     this.rawTarget = new Uint8Array(ev2.target.result);
        //     this.targetFilename = file.name;
        //   };
        //   reader.readAsArrayBuffer(file);
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
      oldResults() {
        // TODO: use date information rather than order?
        let result = {};
        if (this.targetData) {
          result = {...result, ...this.targetData.data.entries};
          console.log(this.targetData);
          for (const mut of this.mutations) {
            console.log(mut);
            result = {...result, ...mut.data.entries};
          }
        }
        return result;
      },
      updatedResults() {
        if (this.selectedColumn) {
          const passAtt = this.attendance && this.useAttendance ? this.attendance : null;
          const rawNewResults = processResult(this.selectedColumn, GradingPolicy, IdentityConfig, passAtt);
          const newResults = rawNewResults.data;
          const allStudents = new Set();
          Object.keys(newResults).forEach(i => allStudents.add(i));
          Object.keys(this.oldResults).forEach(i => allStudents.add(i));
          const result = {};
          for (const student of allStudents) {
            const newValue = newResults[student];
            const newMissing = newValue === undefined || newValue == GradingPolicy.missingValue;
            const oldEntry = this.oldResults[student];
            const oldValue = oldEntry ? oldEntry.result : undefined;
            const oldMissing = oldValue === undefined || oldValue == GradingPolicy.missingValue;
            if (oldValue != newValue) {
              if (newMissing && oldMissing) {
                continue;
              }
              else if (newMissing) {
                result[student] = GradingPolicy.missingValue;
              }
              else {
                result[student] = newValue;
              }
            }
          }
          return result;
        }
        return null;
      },
      injectionResults() {
        if (this.rawTarget && this.updatedResults) {
            try {
              const wb = XLSX.read(this.rawTarget, {type: 'array', cellStyles:true});
              const result = mutateResults(this.updatedResults, wb);
              return result;
            }
            catch (err) {
              console.log(err);
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