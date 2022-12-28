<template>
  <div style="display:flex; justify-content: center;">
    <v-stepper v-model="step" non-linear style="width: 100%; max-width: 60em;">
      <v-stepper-header>
        <v-stepper-step editable step="1" :complete="step > 1" >Introduction</v-stepper-step>
        <v-divider />      
        <v-stepper-step editable step="2" :complete="step > 2" >Final Course Results</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="3" :complete="step > 3" >Attendance</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="4" :complete="step > 4" >SPD File</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="5" >Generate Output</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card>
            <v-card-title>Finalize SPD Results File</v-card-title>
            <v-card-text>
              <p>Read final course results from an <strong>Ans</strong>,
              <strong>Canvas</strong> or <strong>another Spreadsheet dataset</strong>
              and insert this data into a official spreadsheet as provided by SPD or your
              secretariat. You can then send this file to SPD to be imported
              into Osiris.</p>
              <p><strong>Note: </strong> this tool also has the option
                to include attendance data exported from sin-online,
                and automatically generate "Invalid Result" grades
                in cases students do not meet the school's attendance
                requirement.
              </p>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>                        
            </v-card-actions>
          </v-card>
        </v-stepper-content>
        <v-stepper-content step="2">
          <v-card>
            <v-card-title>Final Course Results</v-card-title>
            <v-card-text>
              <p>
                Here you can import and select the source data for the final course results.
                You can either use exported data from <strong>Ans</strong>, an export from
                <strong>Canvas</strong> or a custom spreadsheet with a single header row.
              </p>
              <template v-if="!sourceBook">
                <h3>Choose an import format</h3>
                <p>Click one of the import formats to import data from different sources</p>
                <v-tabs v-model="inputTab" background-color="primary">
                  <v-tabs-slider />
                  <v-tab>Ans/Regular</v-tab>
                  <v-tab>Canvas</v-tab>
                </v-tabs>
                <v-tabs-items v-model="inputTab">
                  <v-tab-item>
                    <h3>Regular Spreadsheet ans Ans Spreadsheets</h3>
                    <p>This option can be used to import results from Ans (exported as "Excel EN")
                      or standard Excel workbooks or csv files with tables that contain a single
                      header row.
                    </p>
                    <FileDropZone accept=".xlsx,.csv" :autoSubmit="true" @change="fileChosen" />
                  </v-tab-item>
                  <v-tab-item>
                    <h3>Canvas CSV Files</h3>
                    <p>This option can be used to import a CSV file exported from the Canvas gradebook.</p>
                    <FileDropZone accept=".csv" :autoSubmit="true" @change="canvasFileChosen" />                  
                  </v-tab-item>
                </v-tabs-items>
              </template>
              <v-card v-else>
                <v-btn block color="error" @click="sourceBook = null">Clear course result data</v-btn>
                <br />
                <v-card-title>Data source loaded. Choose final result</v-card-title>
                <v-card-text>
                <p v-if="availableColumns.length > 0">After you have imported a data source, choose the column from that data source that contains the final course result</p>
                <p v-else>While a dataset was loaded, no suitable columns to use for the final course results were found. Make sure your dataset is valid and correct.</p>
                <v-select
                  class="margin-top"
                  :disabled="availableColumns.length == 0"
                  :items="availableColumns"
                  :item-text="availableColumnToText"
                  :item-value="availableColumnToValue"
                  v-model="sourceColumn"
                  label="Source Column"
                  outlined 
                  block />
                  <br />
                  <v-card >
                    <v-card-title>Data source: {{sourceBook.filename}}</v-card-title>
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
                </v-card-text>                    
              </v-card>
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
            <v-card-title>Attendance</v-card-title>
            <v-card-text>
              <p>If you have an attendance requirement, you can include the attendance data below.</p>
              <p><strong>Note: </strong> the inclusion of attendance data is optional, and this step can be skipped if no attendance requirement applies to your course,
                or if you already computed <code>GGR</code> or <code>IVR</code> results for your final course results.</p>
              <p>Attendance data can be exported from sin-online as follows:</p>
              <ol>
                <li>Go to the owner part of your course's channel and click "Registrations"</li>
                <li>Check all boxes in the "Select" column (unfortunately you have to click them all, it seems)</li>
                <li>Click the "Export Att" button. An old school Excel <code>.xls</code> file will download. You can directly upload that file below.</li>
              </ol>
              <AttendancePanel v-model="attendance" />
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
            <v-card-title>SPD File</v-card-title>
            <v-card-text>
              <p>Here you have to provide the SPD spreadsheet with blank course results that was provided by SPD or the secretariat.</p>
              <template v-if="!targetFilename">
                <h4>Target Spreadsheet (as provided by SPD)</h4>
                <!-- <v-btn color="primary" block @click="clickOpenTarget">Set Target Spreadsheet</v-btn> -->
                <FileDropZone accept=".xlsx" :autoSubmit="true" @change="fileTargetChosen"/>
              </template>
              <template v-else>
                <h5>Target Spreadsheet: {{targetFilename}}</h5>
                <v-btn block color="error" @click="clearTarget">Clear SPD Target Spreadsheet</v-btn>
              </template>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="step--">Previous</v-btn>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>        
        <v-stepper-content step="5">
          <v-card>
            <v-card-title>
              Output Spreadsheet
            </v-card-title>
            <v-card-text>
              <template v-if="hasIssues">
                <v-alert color="error">
                  <h4>Multiple issues must be resolved before a final file can be generated</h4>
                  <ul>
                    <li v-for="issue in issues" :key="issue"> {{ issue }} </li>
                  </ul>
                </v-alert>
              </template>
              <template v-else>
                <p>Download the finalized SPD spreadsheet below.</p>
                <p>After you download this file, <strong>open it in Excel and then save it using Excel, before sending it to SPD</strong>.
                  This way you make sure the file is correct.</p>
                <p>Saving the file with Excel is needed due to a technical limitation of the SheetJS library used to generate the
                  output file. This action ensures all values are saved in a way SPD can properly process the file..
                </p>
                <v-btn block color="primary" @click="downloadResult" :disabled="!injectionResults">Export Results</v-btn>
              </template>
              <template v-if="injectionResults && injectionResults.missing && injectionResults.missing.length > 0">
                <br />
                <v-alert color="warning">
                  <p>There are {{ injectionResults.missing.length }} students who do not appear in the SPD spreadsheet but who do have
                    a final course result in the source dataset. These are typically considered <strong>Own Risk</strong> students that
                    have to be submitted separately to SPD. You can download a spreadsheet with these <strong>Own Risk</strong> students
                    and their results below.
                  </p>
                  <v-btn block color="primary" @click="downloadMissing" :disabled="!injectionResults || !injectionResults.missing || injectionResults.missing.length == 0">
                    Export Own Risk Students Spreadsheet
                  </v-btn>          
                </v-alert>
              </template>
              <br /> <hr /> <br />
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
              <template v-if="injectionResults && injectionResults.warnings && injectionResults.warnings.length > 0">
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
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="step--">Previous</v-btn>
              <v-spacer />
            </v-card-actions>
          </v-card>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script>
  import XLSX from 'xlsx';
  import {processWorkbook,processCanvasWorkbook} from '../util/processWorkbook';
  import GradingPolicy from '../util/GradingPolicy';
  import IdentityConfig from '../util/IdentityConfig';
  import {injectResults} from '../util/injectResults';
  import AttendancePanel from './AttendancePanel';
  import FileDropZone from './FileDropZone';

  export default {
    name: 'Injector',
    components: {
      AttendancePanel,
      FileDropZone
    },
    data: () => ({
      attendance: null,
      useAttendance: true,
      sourceBook: null,
      sourceColumn: null,
      rawTarget: null,
      targetFilename: null,
      dropEmptyStudents: false,
      step: 1,
      inputTab: 0
    }),
    methods: {
      clickOpen() {
        this.$refs.openFileInput.click();
      },
      clickOpenTarget() {
        this.$refs.openFileTarget.click();
      },
      clickOpenCanvas() {
        this.$refs.openCanvasInput.click();
      },
      clearTarget() {
        this.targetFilename = null;
        this.rawTarget = null;
      }, 
      // fileChosen(files) {
      //   if (files[0]) {
      //     const file = files[0];
      //     const reader = new FileReader();
      //     reader.onload = (ev2) => {
      //       const data = new Uint8Array(ev2.target.result);
      //       const workbook = XLSX.read(data, {type: 'array'});
      //       const process = processWorkbook(workbook);
      //       const wb = {filename: file.name, workbook, ...process};
      //       wb.frames.forEach(frame => frame.includeStudents = true);
      //       this.workbooks.push(wb);
      //     };
      //     reader.readAsArrayBuffer(file);
      //   }
      // },
      canvasFileChosen(files) {
        if (files[0]) {
          const file = files[0];
          const reader = new FileReader();
          reader.onload = (ev2) => {
            const data = new Uint8Array(ev2.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const process = processCanvasWorkbook(workbook);
            const wb = {filename: file.name, workbook, ...process};
            this.sourceBook = wb;
          };
          reader.readAsArrayBuffer(file);
        }
      }, 
       fileChosen(files) {
        if (files[0]) {
          const file = files[0];
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
      fileTargetChosen(files) {
        if (files[0]) {
          this.rawTarget = null;
          this.target = null;
          const file = files[0];
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
        if (this.injectionResults && this.injectionResults.missing && this.injectionResults.missing.length > 0) {
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
      issues() {
        const result = [];
        if (!this.sourceBook) {
          result.push('You must provide a data source with final course results');
        }
        else if (!this.selectedColumn) {
          result.push('You must select the column from the data source that contains the final course results');
        }
        if (!this.rawTarget) {
          result.push('You must provide the SPD spreadsheet with blank course results into which the final course results must be injected');
        }
        if (this.injectionResults && this.injectionResults.errors && this.injectionResults.errors.length > 0) {
          result.push('You must make sure that the SPD target spreadsheet has the proper format. Provide the file sent out by SPD/the secretariat as is without any modifications.');
        }
        return result;
      },
      hasIssues() {
        return this.issues && this.issues.length > 0;
      },
      injectionResults() {
        if (this.rawTarget && this.selectedColumn) {
            try {
              const wb = XLSX.read(this.rawTarget, {type: 'array', cellStyles:true});
              const passAtt = this.attendance && this.useAttendance ? this.attendance : null;
              const result = injectResults(this.selectedColumn, wb, GradingPolicy, IdentityConfig, passAtt);
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
      cantExport() {
        return this.injectionResults == null || !this.injectResults.errors;
      }
    },
  }
</script>

<style scoped>
.margin-top {
  margin-top: 1em;
}
</style>