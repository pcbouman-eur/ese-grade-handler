<template>
  <v-card>
  <v-card-text>
    <v-container v-if="availableColumns && availableColumns.length > 0" dense>
      <v-row dense>
        <v-col cols="12" class="extra-dense">
          <SelectColumn v-model="filterCol"
            label="Column" :availableColumns="availableColumns" :availableKeys="availableKeys"
            @input="updateLhsCol" />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="4" class="extra-dense">
          <v-select :items="ConditionOptions"
                    :item-text="c => c.label + ' (' + c.cmpType +')'"
                    :item-value="c => c"
                    v-model="cmpType"
                    @change="updateResult"
                    label="Comparison Type"
                    outlined
                    dense />
        </v-col>
        <v-col cols="8" class="extra-dense">
          <v-text-field v-if="showRhsValue" v-model="rhsValue" @input="updateResult" label="Value" outlined dense />
          <SelectColumn v-if="showRhsColumn" v-model="rhsCol"
            label="Column" :availableColumns="availableColumns" :availableKeys="availableKeys"
            @input="updateRhsCol"/>
        </v-col>
      </v-row>
    </v-container>
  </v-card-text>
  </v-card>
</template>

<script>
  import SelectColumn from './SelectColumn';
  import ConditionOptions from '../util/ConditionOptions';
  
  export default {
    name: 'ConditionPanel',
    components: {
      SelectColumn
    },
    props: ['availableColumns', 'availableKeys'],
    data: () => ({
      filterCol: null,
      rhsCol: null,
      rhsValue: '',
      ConditionOptions,
      cmpType: ConditionOptions[0]
    }),
    created() {
      this.init();
    },
    methods: {
      updateLhsCol(col) {
        this.filterColIdx = col.index;
        this.updateResult();
      },
      updateRhsCol(col) {
        this.rhsColIdx = col.index;
        this.updateResult();
      },
      updateResult() {
        if (this.filterCol) {
          const lhsCol = this.availableColumns[this.filterCol.outputColumn.index];
          const result = {lhs: {name: lhsCol.outputName, data: lhsCol},
                          cmp: this.cmpType};
          if (this.showRhsValue) {
            result.rhs = this.rhsValue;
          }
          if (this.showRhsColumn) {
            const rhsCol = this.availableColumns[this.rhsCol.outputColumn.index];
            result.rhs = {name: rhsCol.outputName, data: rhsCol};
          }
          this.$emit('input', result);
        }
      },
      init() {
        if (!this.filterCol && this.availableColumns.length > 0) {
          this.filterCol = {
             outputKey: this.availableKeys[0],
             outputColumn: this.availableColumns[0],
             outputName: this.availableColumns[0].column
          };
          this.rhsCol = {
             outputKey: this.availableKeys[0],
             outputColumn: this.availableColumns[0],
             outputName: this.availableColumns[0].column
          };
          this.updateResult();
        }
      }
    },
    computed: {
      showRhsValue() {
        return this.cmpType.cmpType == 'value';
      },
      showRhsColumn() {
        return this.cmpType.cmpType == 'column';
      },
    },
    watch: {
      availableColumns() {
        this.init();
      },
    }
  }
</script>

<style scoped>
.extra-dense {
  margin: 0;
  padding: 0;
}
</style>