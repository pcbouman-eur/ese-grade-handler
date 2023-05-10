<template>
  <div style="margin-top: 1em">
    <v-card v-if="value">
      <v-card-title>Attendance data loaded</v-card-title>
      <v-card-text v-if="value && value.sessions">
        <h5>Attendance data loaded for {{attendanceCount}} students.
            {{value.sessions.length}} sessions were found.
        </h5>
        <v-list-item>
          <v-list-item-content>
            <v-text-field type="number" v-model.number="value.threshold"
              min="0" :max="value.sessions.length" label="Minimum attendance threshold" />
          </v-list-item-content>
        </v-list-item>
        <v-alert v-if="value.duplicates.length > 0" type="warning">
          Multiple entries were found for the following students whose data
          was merged: {{value.duplicates.join(', ')}}
        </v-alert>
      </v-card-text>
      <v-card-text v-if="value && !value.sessions">
        <v-alert color="error">
          The attendance data was not correctly loaded. <br />
          Please make sure you follow the explained steps to import the data. <br />
          Your filename should start with <code>att-matrix</code> <br />
          Sin-online has multiple ways to export the data and it is expected you use the steps above!
        </v-alert>
      </v-card-text>
    </v-card>
    <template v-if="value">
      <br />
      <v-btn block color="error" @click="clear">Clear Attendance Data</v-btn>
    </template>
    <template v-else>
      <h4>Provide a sin-online export with attendance data</h4>
      <FileDropZone accept=".xls, .xlsx" :autoSubmit="true" @change="attFileChosen" />
    </template>
    <br />
  </div>
</template>

<script>
  import XLSX from 'xlsx';
  import FileDropZone from './FileDropZone';
  import {processAttendanceWorkbook} from '../util/processWorkbook';

  export default {
    name: 'AttendancePanel',
    components: { FileDropZone },
    props: ['value'],
    methods: {
      // clickAttOpen() {
      //   this.$refs.openAttFileInput.click();
      // },      
      attFileChosen(files) {
        if (files[0]) {
          const file = files[0];
          const reader = new FileReader();
          reader.onload = (ev2) => {
            const data = new Uint8Array(ev2.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const att = processAttendanceWorkbook(workbook);
            this.$emit('input', att);
          };
          reader.readAsArrayBuffer(file);
        }
      },
      clear() {
        this.$emit('input', null);
      }
    },
    computed: {
      attendanceCount() {
        if (this.value && this.value.data) {
          return Object.keys(this.value.data).length;
        }
        return 0;
      }
    },
  }
</script>

<style scoped>
.margin-top {
  margin-top: 1em;
}
</style>