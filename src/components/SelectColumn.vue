<template>
  <v-select
    v-if="modelValue"
    :items="availableColumns"
    :item-title="availableColumnToText"
    :item-value="availableColumnToValue"
    :model-value="currentCol.outputColumn"
    @update:model-value="v => updateSourceColumn(v, currentCol)"
    :label="label"
    variant="outlined"
    density="compact" />
</template>

<script>
  export default {
    name: 'SelectColumn',
    props: ['availableColumns', 'availableKeys', 'modelValue', 'label', 'index'],
    emits: ['update:modelValue'],
    methods: {
      availableColumnToText(c) {
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
        this.$emit('update:modelValue', col);
      },
    },
    computed: {
      currentCol() {
        return this.modelValue;
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