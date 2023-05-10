<template>
    <div>
        <h3>Import source file</h3>
        <p>File supports of different sources are supported:</p>
        <ul>
        <li><strong>Regular Spreadsheets and Ans Spreadsheets:</strong>
            results from Ans (exported as "Excel EN"), standard Excel workbooks
            or csv files with tables that contain a single header row
        </li>
        <li><strong>Canvas CSV Files:</strong> a <code>.csv</code> file exported from the Canvas gradebook.</li>
        <li><strong>SPD results files:</strong> a spreadsheet file as used by SPD to process grade results</li>
        </ul>
        <FileDropZone accept=".xlsx,.csv" :autoSubmit="true" @change="fileChosen" />
    </div>
</template>
<script>
import FileDropZone from './FileDropZone';

export default {
    name: 'SourceImporter',
    components: {
        FileDropZone
    },
    props: ['change'],
    methods: {
        fileChosen(ev) {
            this.$emit('change', ev);
        }
    }
}
</script>