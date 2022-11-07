<template>
  <div style="margin-top: 1em">
    <v-btn color="primary" @click="clickAttOpen">Select Attendance Spreadsheet</v-btn>
    <input type="file" style="display: none" ref="openAttFileInput"
            accept=".xls,.xlsx" @change="attFileChosen" />
    <br />
    <v-card v-if="value">
      <v-card-title>Attendance data</v-card-title>
      <v-card-text>
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
    </v-card>
  </div>
</template>

<script>
  import XLSX from 'xlsx';
  import {processAttendanceWorkbook} from '../util/processWorkbook';

  export default {
    name: 'AttendancePanel',
    props: ['value'],
    methods: {
      clickAttOpen() {
        this.$refs.openAttFileInput.click();
      },      
      attFileChosen(ev) {
        if (ev.target.files[0]) {
          const file = ev.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev2) => {
            const data = new Uint8Array(ev2.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const att = processAttendanceWorkbook(workbook);
            this.$emit('input',att);
          };
          reader.readAsArrayBuffer(file);
        }
      },
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