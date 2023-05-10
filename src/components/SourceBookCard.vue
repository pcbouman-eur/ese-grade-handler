<template>
<v-card>
    <v-card-title>Data source: {{sourceBook.filename}}</v-card-title>
    <v-card-text>
        <h3>The following sheets were found</h3>
        <template v-if="askInclude">
            <v-card v-for="frame in sourceBook.frames" :key="frame.sheetName">
                <v-card-title>{{frame.sheetName}}</v-card-title>
                <v-card-actions>
                    <v-switch label="Add all students to output" v-model="frame.includeStudents" />
                </v-card-actions>
            </v-card>
        </template>
        <v-list-item v-else v-for="frame in sourceBook.frames" :key="frame.sheetName">
            <v-list-item-content>{{frame.sheetName}}</v-list-item-content>
        </v-list-item>
        <v-alert v-if="!askInclude && sourceBook.frames.length > 0" type="success">
            {{ sourceBook.frames.length }} sheets successfully imported.
            <ul>
            <li v-for="frame of sourceBook.frames" :key="frame.sheetName">{{ frame.sheetName }}</li>
            </ul>
        </v-alert>
        <v-alert v-if="sourceBook.skipped.length > 0" type="warning">
            {{sourceBook.skipped.length}} sheets were skipped.
            <br /> Click the troubleshoot button to see details.
            <br />
            <TroubleshootDialog :workbook="sourceBook" />
        </v-alert>              
    </v-card-text>
  </v-card>
</template>
<script>
import TroubleshootDialog from './TroubleshootDialog';

export default {
    name: 'SourceBookCard',
    props: ['sourceBook', 'askInclude'],
    components: { TroubleshootDialog }
}
</script>