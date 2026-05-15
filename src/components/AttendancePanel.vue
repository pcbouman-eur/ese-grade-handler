<template>
  <div style="margin-top: 1em">
    <v-card v-if="modelValue">
      <v-card-title>Attendance data loaded</v-card-title>
      <v-card-text v-if="modelValue && modelValue.sessions">
        <h5>Attendance data loaded for {{attendanceCount}} students.
            {{modelValue.sessions.length}} sessions were found.
        </h5>
        <v-list-item>
          <v-text-field type="number" v-model.number="modelValue.threshold"
            min="0" :max="modelValue.sessions.length" label="Minimum attendance threshold" />
        </v-list-item>
        <v-alert v-if="modelValue.duplicates.length > 0" type="warning">
          Multiple entries were found for the following students whose data
          was merged: {{modelValue.duplicates.join(', ')}}
        </v-alert>
      </v-card-text>
      <v-card-text v-if="modelValue && !modelValue.sessions">
        <v-alert type="error">
          The attendance data was not correctly loaded. <br />
          Please make sure you follow the explained steps to import the data. <br />
          Your filename should start with <code>att-matrix</code> <br />
          Sin-online has multiple ways to export the data and it is expected you use the steps above!
        </v-alert>
      </v-card-text>
    </v-card>
    <template v-if="modelValue">
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
  import * as XLSX from 'xlsx';
  import FileDropZone from './FileDropZone';
  import {processAttendanceWorkbook} from '../util/processWorkbook';

  export default {
    name: 'AttendancePanel',
    components: { FileDropZone },
    props: ['modelValue'],
    emits: ['update:modelValue'],
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
            this.$emit('update:modelValue', att);
          };
          reader.readAsArrayBuffer(file);
        }
      },
      clear() {
        this.$emit('update:modelValue', null);
      }
    },
    computed: {
      attendanceCount() {
        if (this.modelValue && this.modelValue.data) {
          return Object.keys(this.modelValue.data).length;
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