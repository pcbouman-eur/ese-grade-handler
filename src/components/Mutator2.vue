<template>
  <div style="display:flex; justify-content: center;">
    <v-stepper v-model="step" non-linear style="width: 100%; max-width: 60em;" @change="stepperChange()">
      <v-stepper-header>
        <v-stepper-step editable step="1" :complete="step > 1" >Updated Results</v-stepper-step>
        <v-divider />      
        <v-stepper-step editable step="2" :complete="step > 2" >Previous Results</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="3" :complete="step > 3" >Attendance</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="4" :complete="step > 4" >Signature</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="5" >Generate Output</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card>
            <v-card-title>Mutate Results</v-card-title>
            <v-card-text>
              <p>After course results have been established, this workflow can compare
                 the submitted grades to a spreadsheet with updated course results.
                 The output is a zip-file with signed documents that can be submitted
                 to Osiris with grade changes. 
              </p>
              <hr/>
              <br />
              <h2>Updated Course Results</h2>
              <p>
                Here you can import and select the source data for the updated final course results.
                You can either use exported data from <strong>Ans</strong>, an export from
                <strong>Canvas</strong> or a custom spreadsheet with a single header row.
              </p>
              <SourceImporter v-if="!sourceBook" @change="fileChosen" />
              <v-card v-else>
                <v-btn block color="error" @click="sourceBook = null">Clear course result data</v-btn>
                <br />
                <v-card-title>Data source loaded. Choose final result</v-card-title>
                <v-card-text>
                <v-alert color="warning" v-if="!sourceColumn">Please pick a column with final results before you continue!</v-alert>
                <p v-if="availableColumns.length > 0">After you have imported a data source, choose the column from that data source that contains the updated final course result</p>
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
                  <SourceBookCard :sourceBook="sourceBook" />
                </v-card-text>                    
              </v-card>                  
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>                        
            </v-card-actions>
          </v-card>
        </v-stepper-content>
        <v-stepper-content step="2">
          <v-card>
            <v-card-title>Previous Course Results</v-card-title>
            <v-card-text>
              <p>Here you have to provide the Osiris spreadsheet with previous course results that was submitted to Osiris by you or the secretariat.</p>
              <template v-if="!targetFilename">
                <h4>Result Spreadsheet (as previously submitted to Osiris)</h4>
                <!-- <v-btn color="primary" block @click="clickOpenTarget">Set Target Spreadsheet</v-btn> -->
                <FileDropZone accept=".xlsx" :autoSubmit="true" @change="fileTargetChosen"/>
              </template>
              <template v-else>
                <h5>Target Spreadsheet: {{targetFilename}}</h5>
                <v-btn block color="error" @click="clearTarget">Clear Osiris Target Spreadsheet</v-btn>
              </template>
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
              <v-btn block color="primary" @click="step++">Skip Attendance Data</v-btn>
              <br />
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
        <!-- start -->
        <v-stepper-content step="4">
          <v-card>
            <v-card-title>Signature</v-card-title>
            <v-card-text>
              <p>The forms needs to be signed with the name of the teacher and the signature of the teacher.</p>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="teacherName"  label="Name of the Teacher" hint="Please fill in your name"/>
                  </v-col>
                </v-row>
              </v-container>
              <hr />
              <p>Please draw your signature below.  This signature will be copied to all generated forms.</p>
              <vueSignature class="signature-box" ref="signature" :w="signatureWidth+'px'" :h="signatureHeight+'px'" />
              <div>
                <v-btn class="draw-button" fab small color="primary" @click="$refs.signature.undo()"><v-icon dark>mdi-undo</v-icon></v-btn>
                <v-btn class="draw-button" fab small color="error" @click="$refs.signature.clear()"><v-icon dark>mdi-delete</v-icon></v-btn>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="step--">Previous</v-btn>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>
        <!-- end -->        
        <v-stepper-content step="5">
          <v-card>
            <v-card-title>
              Generate Output
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
                <p>Download the finalized files below.</p>
                <v-btn block color="primary" @click="downloadForms" :disabled="!injectionResults">Download Grade Change Forms</v-btn>
                <br />
                <v-btn block color="primary" @click="downloadResult" :disabled="!injectionResults">Export Full Result Spreadsheet</v-btn>
                <br />
                <v-btn block color="primary" @click="downloadUpdates" :disabled="!injectionResults">Export Update Grade Change Spreadsheet</v-btn>
              </template>
              <template v-if="injectionResults && injectionResults.missing && injectionResults.missing.length > 0">
                <br />
                <v-alert color="warning">
                  <p>There are {{ injectionResults.missing.length }} students who do not appear in the Osiris spreadsheet but who do have
                    a final course result in the source dataset. These are typically considered <strong>Own Risk</strong> students that
                    have to be submitted separately to Osiris. You can download a spreadsheet with these <strong>Own Risk</strong> students
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
  import { processWorkbookAttemptAll, processSpdWorkbook } from '../util/processWorkbook';
  import GradingPolicy from '../util/GradingPolicy';
  import IdentityConfig from '../util/IdentityConfig';
  import { injectResults, readResultEntries, processResult, mutateResults } from '../util/injectResults';
  import SourceBookCard from './SourceBookCard';
  import SourceImporter from './SourceImporter';
  import FileDropZone from './FileDropZone';
  import AttendancePanel from './AttendancePanel'
  import vueSignature from "vue-signature"
  import { generateMutationDocument, downloadZipFile, sanitizeFilename } from '@/util/generateSignatureZip';

  export default {
    name: 'Injector',
    components: {
      SourceImporter,
      SourceBookCard,
      FileDropZone,
      AttendancePanel,
      vueSignature
    },
    data: () => ({
      attendance: null,
      useAttendance: true,
      sourceBook: null,
      sourceColumn: null,
      rawTarget: null,
      targetData: null,
      targetFilename: null,
      dropEmptyStudents: false,
      step: 1,
      inputTab: 0,
      signatureWidth: 800,
      signatureHeight: 200,
      signatureCheck: false,
      teacherName: '',
      courseName: '',
      courseCode: '',
      examination: '',
      busy: false
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
       fileChosen(files) {
        if (files[0]) {
          const file = files[0];
          const reader = new FileReader();
          reader.onload = (ev2) => {
            const data = new Uint8Array(ev2.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            //const process = processWorkbook(workbook);
            const process = processWorkbookAttemptAll(workbook);
            const wb = {filename: file.name, workbook, ...process};
            this.sourceBook = wb;
          };
          reader.readAsArrayBuffer(file);
        }
      },
      // fileTargetChosen(files) {
      //   if (files[0]) {
      //     this.rawTarget = null;
      //     this.target = null;
      //     const file = files[0];
      //     const reader = new FileReader();
      //     reader.onload = (ev2) => {
      //       this.rawTarget = new Uint8Array(ev2.target.result);
      //       this.targetFilename = file.name;
      //     };
      //     reader.readAsArrayBuffer(file);
      //   }
      // },      
      fileTargetChosen(files) {
        if (files[0]) {
          this.rawTarget = null;
          this.target = null;
          const file = files[0];
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
            const process = processSpdWorkbook(workbook);
            this.spdData = process.frames[0].df;
            this.courseName = process.courseName;
            this.courseCode = process.courseCode;
            this.examination = process.examination;
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
          const date = new Date().toLocaleDateString('nl-nl');
          const fname = sanitizeFilename(this.targetFilename.replace('.xlsx',`-revision-${date}.xlsx`));
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
      },
      downloadUpdates() {
        if (this.mutationResults && this.mutationResults.wb) {
          const date = new Date().toLocaleDateString('nl-nl');
          const fname = sanitizeFilename(this.targetFilename.replace('.xlsx',`-updates-${date}.xlsx`));
          XLSX.writeFile(this.mutationResults.wb, fname);
        }
      },
      stepperChange() {
        if (this.$refs?.signature) {
          this.signatureCheck = !this.$refs.signature.isEmpty();
        }
        else {
          this.signatureCheck = false;
        }
      },
      downloadForms() {
        // TODO: use date information rather than order?
        // let result = {};
        // if (this.targetData) {
        //   result = {...result, ...this.targetData.data.entries};
        //   console.log(this.targetData);
        //   for (const [std, res] of Object.entries(this.targetData.data.entries)) {
        //     console.log(std, res);
        //   }
        // }
        // console.log(result);
        console.log(this.processedResults.data);
        const signatureDate = new Date().toLocaleDateString('nl-nl');
        new Promise((resolve) => {
          const data = [];
          const signatureBlob = this.$refs.signature.sig.canvas.toDataURL();
          for (const row of this.spdData.data) {
            const oldResult = row[3];
            const newResult = this.processedResults.data[row[0]] || 'NO';
            if (oldResult == newResult) {
              continue;
            }
            const stdElement = { 
              courseName: this.courseName,
              courseCode: this.courseCode,
              exam: this.examination,
              gradeDate: row[2],
              signatureDate,
              studentId: row[0],
              studentName: row[1],
              oldResult: oldResult,
              studentResult: newResult,
              teacherName: this.teacherName,
              signatureBlob,
              signatureWidth: 0.59*this.signatureWidth,
              signatureHeight: 0.59*this.signatureHeight,
            };
            data.push(stdElement);
          }
          const documents = data.map(entry => ({
            studentid : entry.studentId,
            studentname: entry.studentName,
            document: generateMutationDocument(entry)
          }));
          resolve(documents);
        })
        .then( documents => {
          const filename = `Grade Changes ${this.courseCode} ${this.courseName} ${signatureDate}.zip`;
          downloadZipFile(documents, sanitizeFilename(filename))
            .finally(() => this.busy = false);
        });
      },
    },
    watch: {
      step() {
        this.stepperChange();
      }
    },
    computed: {
      issues() {
        const result = [];
        if (!this.sourceBook) {
          result.push('You must provide a data source with the updated course results');
        }
        else if (!this.selectedColumn) {
          result.push('You must select the column from the data source that contains the final course results');
        }
        if (!this.rawTarget) {
          result.push('You must provide the Osiris spreadsheet with the previous course results');
        }
        if (this.injectionResults && this.injectionResults.errors && this.injectionResults.errors.length > 0) {
          result.push('You must make sure that the Osiris target spreadsheet has the proper format. Provide the file sent out by Osiris/the secretariat as is without any modifications.');
        }
        if (this.teacherName.trim() == '') {
          result.push('You need to provide a name of the teacher');
        }
        if (!this.signatureCheck) {
          result.push('No signature to sign the forms with was provided yet');
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
      processedResults() {
        if (this.rawTarget && this.selectedColumn) {
            try {
              const passAtt = this.attendance && this.useAttendance ? this.attendance : null;
              const result = processResult(this.selectedColumn, GradingPolicy, IdentityConfig, passAtt);
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
      },
      oldResults() {
        // TODO: use date information rather than order?
        let result = {};
        if (this.targetData) {
          result = {...result, ...this.targetData.data.entries};
          // console.log(this.targetData);
          // for (const mut of this.mutations) {
          //   console.log(mut);
          //   result = {...result, ...mut.data.entries};
          // }
        }
        return result;
      },
      updatedResults() {
        if (this.selectedColumn) {
          const passAtt = this.attendance && this.useAttendance ? this.attendance : null;
          console.log("Processing results");
          const rawNewResults = processResult(this.selectedColumn, GradingPolicy, IdentityConfig, passAtt);
          console.log("Results processed");
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
      mutationResults() {
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
    },
  }
</script>

<style scoped>
.margin-top {
  margin-top: 1em;
}
</style>