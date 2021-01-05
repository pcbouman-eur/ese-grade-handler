<template>
  <v-select
    v-if="value"
    :items="availableColumns"
    :item-text="availableColumnToText"
    :item-value="availableColumnToValue"
    :value="currentCol.outputColumn"
    @change="v => updateSourceColumn(v, currentCol)"
    :label="label"
    outlined
    dense />
</template>

<script>
  export default {
    name: 'SelectColumn',
    props: ['availableColumns', 'availableKeys', 'value', 'label', 'index'],
    methods: {
      availableColumnToText(c) {
        //console.log(c);
        if (c.type == 'attendance-cat') {
          return 'Attendance Status';
        }
        if (c.type == 'attendance-bool') {
          return 'Attendance Passed';
        }
        if (c.type == 'attendance-count') {
          return 'Attendance Count';
        }        
        if (c.type == 'df') {
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
        }
        return '[ERROR - Unknown Column Type]';
      },
      availableColumnToValue(c) {
        return {index: c.index, column: c.column};
      },
      updateSourceColumn(newVal, col) {
        col.outputColumn = newVal;
        col.outputName = newVal.column;
        this.$emit('input', col);
      },
    },
    computed: {
      currentCol() {
        return this.value;
      }
    }
  }
</script>

<style scoped>
.dense {
  margin: 0;
  padding: 0;
}
</style>