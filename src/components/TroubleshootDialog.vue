<template>
    <div class="main">
        <v-btn color="primary" @click="ev => setVisible(true)">Troubleshoot</v-btn>
        <v-dialog max-width="60em" v-model="dialog">
            <v-card>
                <v-card-title>Troubleshoot {{ workbook.filename }}</v-card-title>
                <v-card-text>
                    <p>Select the tab with the name of the rejected sheet to investigate why the data was rejected.</p>
                    <v-card>
                        <v-tabs v-model="tab">
                            <v-tab v-for="(sheet, idx) of workbook.skipped" :key="sheet.sheetName" :value="idx">
                                {{ sheet.sheetName }}
                            </v-tab>
                        </v-tabs>
                        <v-card-text>
                            <v-window v-model="tab">
                                <v-window-item class="card-body" v-for="(sheet, idx) of workbook.skipped" :key="sheet.sheetName" :value="idx">
                                    <h1>{{ sheet.sheetName }}</h1>
                                    <br />
                                    <p>{{ sheet.error.msg }}</p>
                                    <p>Below you can see why each column of this sheet was rejected as a key column</p>
                                    <template v-if="sheet.error && sheet.error.issues">
                                        <div v-for="[colname, specs] of Object.entries(sheet.error.issues)" :key="colname">
                                            <h3>{{ colname }}</h3>
                                            <ul v-if="sheet.error.issues">
                                                <li v-for="[specName, spec] of Object.entries(specs)" :key="specName">
                                                    <strong>{{ specName }}</strong> : {{ spec.error }}
                                                </li>
                                            </ul>                        
                                        </div>
                                    </template>
                                    <template v-else-if="sheet.error.details">
                                        <h4>{{ sheet.error.msg }}</h4>
                                        <p> {{ sheet.error.details }}</p>
                                    </template>
                                </v-window-item>
                            </v-window>
                        </v-card-text>
                    </v-card>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" block @click="close">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: 'TroubleshootDialog',
    props: ['workbook'],
    data: () => ({
        dialog: false,
        tab: 0
    }),
    methods: {
        setVisible(val) {
            this.dialog = val;
        },
        close() {
            this.dialog = false;
        }
    },
}
</script>

<style scoped>
.main {
    margin-top: 1em;
}


.card-body {
    max-height: calc(100vh - 300px);
    overflow-y: auto;
}
</style>