<template>
  <div style="display:flex; justify-content: center;">
    <v-stepper v-model="step" non-linear style="width: 100%; max-width: 60em;" @change="stepperChange()">
      <v-stepper-header>
        <v-stepper-step editable step="1" :complete="step > 1" >Introduction</v-stepper-step>
        <v-divider />      
        <v-stepper-step editable step="2" :complete="step > 2" >Load Data</v-stepper-step>
        <v-divider />
        <v-stepper-step editable step="3" :complete="step > 3" >Input Signature</v-stepper-step>
        <v-divider />
        <!-- <v-stepper-step editable step="4" :complete="step > 4" >Signature Date</v-stepper-step>
        <v-divider /> -->
        <v-stepper-step editable step="4" >Obtain Output</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card>
            <v-card-title>Signer</v-card-title>
            <v-card-text>
              <p>Generate signed SPD forms out of grade results.</p>
              <p>As SPD can for some reason not handle a spreadsheet with mutations for all students,
                they came up with the idea to require an individual form with date and signature for for
                each mutation. This tool helps automated this process.
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
            <v-card-title>Input Spreadsheets</v-card-title>
            <v-card-text>
              <h3>Import SPD spreadsheet</h3>
              <p>Select an SPD-style spreadsheet with student results</p>
              <FileDropZone accept=".xlsx" :autoSubmit="true" @change="spdFileChosen" />
              <br />
              <v-alert v-if="spdData" color="primary">
                <h4>Data for course {{ courseName }} ({{ courseCode }}) loaded</h4>
                <p>Data for {{ spdData.data.length }} students loaded</p>
              </v-alert>
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
                <v-btn fab small color="primary" @click="$refs.signature.undo()"><v-icon dark>mdi-undo</v-icon></v-btn>
                <v-btn fab small color="error" @click="$refs.signature.clear()"><v-icon dark>mdi-delete</v-icon></v-btn>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="step--">Previous</v-btn>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>
        <!-- <v-stepper-content step="4">
          <v-card>
            <v-card-title>Output Spreadsheet</v-card-title>
            <v-card-text>
              <p>Please pick the date of signing the forms below. By default, today is used.</p>
              <v-date-picker v-model="selectedDate" locale="nl-nl" />
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="step--">Previous</v-btn>
              <v-spacer />
              <v-btn color="primary" @click="step++">Next</v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>         -->
        <v-stepper-content step="4">
          <v-card>
            <v-card-title>
              Generate Zipfile
            </v-card-title>
            <v-card-text>
                <v-alert color="warning" v-if="hasIssues">
                  <h3>There are still some issues to resolve before the forms can be generated</h3>
                  <div>
                    <ul>
                      <li v-for="issue in issues" :key="issue">{{ issue }}</li>
                    </ul>
                  </div>
                </v-alert>
                <p v-else>Download a zip-file with a single form for each student</p>
                <div v-if="busy">
                  <v-progress-circular indeterminate />
                  Generating zip-file with forms
                </div>
            </v-card-text>
            <v-card-actions>
              <v-btn block color="primary" :disabled="busy || hasIssues" @click="generateForms()"><v-icon dark>mdi-zip</v-icon> Generate Zip File</v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script>
  import XLSX from 'xlsx';
  import {processWorkbook, processSpdWorkbook} from '../util/processWorkbook';
  import FileDropZone from './FileDropZone.vue';
  import vueSignature from "vue-signature"

  import { generateDocument, downloadZipFile } from '@/util/generateSignatureZip';

  
  export default {
    name: 'Signer',
    components: {
      FileDropZone, vueSignature
    },
    data: () => ({
      step: 1,
      inputTab: 0,
      spdData: null,
      //selectedDate: new Date().toISOString().replace(/T.*/,''),
      courseName: '',
      courseCode: '',
      teacherName: '',
      signatureWidth: 800,
      signatureHeight: 200,
      busy: false,
      signatureCheck: false
    }),
    methods: {
      generateForms() {
        //const signatureDate = new Date(this.selectedDate).toLocaleDateString('nl-nl');
        const signatureDate = new Date().toLocaleDateString('nl-nl');
        const signatureBlob = this.$refs.signature.sig.canvas.toDataURL();
        const data = [];
        for (const row of this.spdData.data) {
          const stdElement = { 
            courseName: this.courseName,
            courseCode: this.courseCode,
            gradeDate: row[2],
            signatureDate,
            studentId: row[0],
            studentName: row[1],
            studentResult: row[3],
            teacherName: this.teacherName,
            signatureBlob,
            signatureWidth: 0.4*this.signatureWidth,
            signatureHeight: 0.4*this.signatureHeight,
          };
          data.push(stdElement);
        }
        const documents = data.map(entry => ({
          studentid : entry.studentId,
          document: generateDocument(entry)
        }));
        this.busy = true;
        downloadZipFile(documents, 'forms.zip')
          .finally(() => this.busy = false);
      },
      clickOpenSpd() {
        this.$refs.openSpdInput.click();
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
            this.spdData = process.frames[0].df;
            this.courseName = process.courseName;
            this.courseCode = process.courseCode;
          };
          reader.readAsArrayBuffer(file);
        }
      },
      stepperChange() {
        if (this.$refs?.signature) {
          this.signatureCheck = !this.$refs.signature.isEmpty();
        }
        else {
          this.signatureCheck = false;
        }
      }
    },
    computed: {
      issues() {
        const result = [];
        if (!this.spdData) {
          result.push('You need to load data from a SPD Spreadsheet file');
        }
        else if (this.spdData?.data?.length <= 0){
          result.push('No student results were obtained from the SPD Spreadsheet file');
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
        return this.issues.length > 0;
      }
    },
  }
</script>

<style scoped>
.signature-box {
  border: 1px solid black;
}
</style>