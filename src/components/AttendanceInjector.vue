<template>
  <div style="display:flex; justify-content: center;">
    <v-stepper v-model="step" non-linear style="width: 100%; max-width: 60em;">
      <v-stepper-header>
        <v-stepper-step editable step="1" :complete="step > 1" >Introduction</v-stepper-step>
        <v-divider />      
        <v-stepper-step editable step="2" :complete="step > 2" >Attendance Data</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="3" :complete="step > 3" >Osiris File</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="4" >Generate Output</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card>
            <v-card-title>Academy Attendance to Osiris Results File</v-card-title>
            <v-card-text>
              <p>The purpose of this tool is to process a spreadsheet exported with
                Academy Attendance and inject the partial course results related to
                the attendance requirement into an Osiris spreadsheet.</p>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>                        
            </v-card-actions>
          </v-card>
        </v-stepper-content>
        <v-stepper-content step="2">
          <v-card>
            <v-card-title>Attendance Data</v-card-title>
            <v-card-text>
              <v-card v-if="attendance">
                <v-card-title>Attendance data loaded</v-card-title>
                <v-card-text>
                  <p><strong>Attendance filename:</strong> {{ attendanceFileName }}</p>
                  <p><strong>Attendance data loaded for</strong> {{attendance.shape[0]}} students.</p>
                  <p><strong>Most common number of sessions:</strong> {{mostCommonAttendance}}.</p>
                  <v-list-item>
                    <v-list-item-content>
                      <v-text-field type="number" v-model.number="minimumAttendance"
                        min="0" label="Minimum attendance threshold" />
                    </v-list-item-content>
                  </v-list-item>

                  <v-card>
                  <v-card-title>Result Summary</v-card-title>
                  <v-card-text>
                    <table>
                      <tbody>
                      <tr v-for="[status,count] of Object.entries(attendanceStatus.stats)" :key="'entry-'+status">
                        <th style="text-align: left" scope="row"><strong>{{ status }} ({{ describe(status) }})</strong></th>
                        <td style="text-align: right">{{ count }}</td>
                      </tr>
                      </tbody>
                    </table>
                  </v-card-text>
                </v-card>
                <br />
                <v-btn color="error" @click="clearAttendance">Clear Attendance Data</v-btn>
                </v-card-text>
              </v-card>
              <template v-else>
                <p>Please provide the attendance data of your course exported from Academy Attendance.</p>
                <p>Attendance data can be exported from Academy Attendance as follows:</p>
                <ol>
                  <li>Go to the Canvas page of your course and select the "Academy Attendance" tool</li>
                  <li>If this is the first time you open the tool, you get a screen where you have to select all groups of your course.</li>
                  <li>Go  to the <em>Attendance Overview</em> tab and click the <em>Export</em> button in the top right of the tool (just under the <em>Search</em> field)</li>
                  <li>Wait a while and go to the <em>Overview</em> tab. Your download should be listed under <em>Downloads</em>. Click the small download icon to obtain the needed spreadsheet file.</li>
                </ol>
                <FileDropZone accept=".xlsx" :autoSubmit="true" @change="attFileChosen" />
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
            <v-card-title>Osiris File</v-card-title>
            <v-card-text>
              <p>Here you have to provide the Osiris spreadsheet with blank course results that was exported from Osiris.</p>
              <template v-if="!targetFilename">
                <h4>Target Spreadsheet (as exported from Osiris)</h4>
                <FileDropZone accept=".xlsx" :autoSubmit="true" @change="fileTargetChosen"/>
              </template>
              <template v-else>
                <h5>Target Spreadsheet: {{targetFilename}}</h5>
                <v-btn block color="error" @click="clearTarget">Clear Target Spreadsheet</v-btn>
              </template>
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
              <template v-if="hasIssues">
                <v-alert color="error">
                  <h4>Multiple issues must be resolved before a final file can be generated</h4>
                  <ul>
                    <li v-for="issue in issues" :key="issue"> {{ issue }} </li>
                  </ul>
                </v-alert>
              </template>
              <template v-else>
                <p>Download the finalized Osiris spreadsheet below.</p>
                <p>After you download this file, <strong>open it in Excel and then save it using Excel, before sending it to Osiris or the Secretariat</strong>.
                  This way you make sure the file is correct.</p>
                <p>Saving the file with Excel is needed due to a technical limitation of the SheetJS library used to generate the
                  output file. This action ensures all values are saved in a way Osiris can properly process the file..
                </p>
                <v-btn block color="primary" @click="downloadResult" :disabled="!injectionResults">Export Results</v-btn>
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
  import {injectAttendance} from '../util/injectResults';
  import FileDropZone from './FileDropZone';

  import XLSX from 'xlsx';
  import { academyAttendanceBookToFrame, determineCommonSessionCount, determineAttendanceStatus, STATUS_DESCRIPTIONS } from '../util/AcademyAttendance';
  
  export default {
    name: 'AttendanceInjector',
    components: {
      FileDropZone
    },
    data: () => ({
      attendance: null,
      attendanceFileName: '',
      useAttendance: true,
      rawTarget: null,
      minimumAttendance: 0,
      targetFilename: null,
      dropEmptyStudents: false,
      step: 1,
      inputTab: 0
    }),
    methods: {
      clickOpenTarget() {
        this.$refs.openFileTarget.click();
      },
      clearAttendance() {
        this.attendance = null;
      },
      clearTarget() {
        this.targetFilename = null;
        this.rawTarget = null;
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
      clickAttOpen() {
        this.$refs.openAttFileInput.click();
      },      
      attFileChosen(files) {
        if (files[0]) {
          const file = files[0];
          const reader = new FileReader();
          reader.onload = (ev2) => {
            const data = new Uint8Array(ev2.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            try {
              this.attendance = academyAttendanceBookToFrame(workbook);
              this.attendanceFileName = file.name;
            }
            catch (err) {
              console.log(err);
            }

          };
          reader.readAsArrayBuffer(file);
        }
      },
     downloadResult() {
        if (this.injectionResults && this.injectionResults.wb) {
          const fname = this.targetFilename.replace('.xlsx','-injected.xlsx');
          XLSX.writeFile(this.injectionResults.wb, fname);
        }
      },
      describe(st) {
          return STATUS_DESCRIPTIONS[st] || 'No description';
        }
    },
    computed: {
        mostCommonAttendance() {
          if (this.attendance) {
            return determineCommonSessionCount(this.attendance);
          }
          return 0;
        },
        attendanceStatus() {
          if (this.attendance) {
            return determineAttendanceStatus(this.attendance, this.minimumAttendance);
          }
          return null;
        },
        issues() {
          let result = [];
          if (this.attendanceStatus?.warnings) {
            result = [...this.attendanceStatus.warnings];
          }
          if (!this.attendance) {
            result.push('You must provide a spreadsheet exported from Academy Attendance');
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
          if (this.rawTarget && this.attendanceStatus) {
              try {
                const wb = XLSX.read(this.rawTarget, {type: 'array', cellStyles:true});
                const result = injectAttendance(wb, this.attendanceStatus.result);
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
    watch: {
      mostCommonAttendance(newVal) {
        this.minimumAttendance = Math.ceil(0.7 * newVal);
      }
    }
  }
</script>

<style scoped>
.margin-top {
  margin-top: 1em;
}
</style>