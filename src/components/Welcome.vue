<template>
  <v-container>
    <v-row align='center' justify='center'>
      <v-col cols="6">
        <h2>ESE Grade Handler</h2>
        <h3>Introduction</h3>
        <p>This is a set of tools that attempt to simplify a number of tasks that
           involve grades from students. Compared to earlier versions, the User Interface of this tool should now
           be slightly more intuitive.</p>
        <p><strong>When using this tool, data never leaves your computer.
          All data processing in this tool is performed within your web-browser, and no data is transmitted over the internet.</strong>
          <!-- From a technical point of view, Github Pages does not provide any options to perform server-side processing of data.
          If you are insecure, you can unplug your computer from the internet while working on the grades and it will still work. -->
        </p>
        <p>Currently, the following tools are provided:</p>
        <ul>
          <li><strong>Combine Results: </strong> allows you to combine multiple data sources (Ans, Canvas, custom, last years grades) into a single
            master spreadsheet. This makes it easy to compute customized final grades and prevents you from having to use any advanced
            Excel-lookup wizardry for different common data sources. This step can be skipped if your course result is based on a single grade (e.g. final exam).</li>
          <li><strong>Prepare Official: </strong> take a spreadsheet with final course grades (exported from Ans or Canvas, or your own master spreadsheet)
            and inject the final course results into a SPD spreadsheet as provided by SPD/the secretariat.
            Also allows you to include attendance data from sin-online (Academy Attendance is still work in progress).
            All important steps perform useful sanity checks and make sure the final course results are in compliance with school rules.</li>
          <!-- <li><strong>Signer: </strong> take a spreadsheet with final grades in the format processed by SPD, and generates a <code>.zip</code>
            file with signed Word documents for each grade. This is particularly useful to submit grade changes, after SPD changed the policy
            so that now one file per student is required for grade changes.</li> -->
          <li><strong>Grade Changes: </strong> a tool that can be used to prepare relevant documents to change grades, after a spreadsheet with grades was
            earlier submitted to SPD. Requires that you have a copy of an SPD spreadsheet with the last submitted grades.</li>
        </ul>
        <h3>How does it work</h3>
        <p>For this tool to be able to use your spreadsheet files, they must
           have a certain structure. Sheets or Tabs that do not have this
           structure will be ignored.</p>
        <ul style="margin-bottom: 1em;">
          <li>A sheet with results must have a table that starts in cell
            <code>A1</code> with a header in row <code>A</code> (the first
            row) and data starting at row <code>B</code> (the second row).
            Sheets with two header rows, for example as they are exported by
            Canvas, are not supported; you are advised to just delete additional
            header rows before you use a spreadsheet in this tool.</li>
            <li>At least one of the columns in a sheet must be a <em>key-column</em>
            with student identities. A student identity is any piece of text that
            contains a single erna identity (e.g. <code>123456ab</code>) somewhere.
            </li>
            <li>A key column must hold a student identity in every row of the data,
              and every identity with a column must be unique: if the same student
              identity occurs twice within a key column, the column is not accepted
              as a key column.
            </li>
            <li>If there are multiple key columns, one of them is picked arbitrarily.
              If there are different key columns that have conflicting student identities,
              you may get unexpected results. It is thus advised to only have a single
              column with student identities. Currently, there is no check in place
              to warn you against these types of scenarios, although this may be added
              in the future.              
            </li>
        </ul>
        <h3>Attendance Data (new)</h3>
        <p>Attendance data, exported verbatim from sin-online as <code>xls</code>
        file, is now also supported. <strong>Note: Academy Attedance support is not
          implemented yet.</strong>
        If you import attendance data, double entries
        are automatically merged (i.e. if students switched between session) and
        a 70% threshold is used to determine attendance. This threshold can be
        adjusted. Attendance data is supported both for the combiner, where you
        can add attendance columns to your output, and the injector, where it
        injects GGR when this is appropiate.</p>
        <h3>Is this safe?</h3>
        <p>All processing of grades happens solely within your web-browser,
          and no data is transmitted over the internet by this tool. Once
          this website is loaded in your browser, you can disconnect from the
          internet to handle your grades offline. If you don't believe this, 
          you can easily check this with the network activity inspector in your
          browser's developer tools, or by inspecting the <a href="https://github.com/pcbouman-eur/ese-grade-handler"
          target="blank">source code of this application</a>
          (it is a bit ugly and copy-pasty).</p>
        <h3>I need feature X or feature Y is not working for me, can you do something about it?</h3>
        <p>My main motivation to build this is for my own work as a teacher, and
          I do not have time to provide support. I built this in
          less than 10 hours, mostly to make my own life in handling grades
          easier. If you want to discuss something, you contact me, or even
          <a href="https://github.com/pcbouman-eur/ese-grade-handler/issues"
          target="blank">
          raise an issue on Github</a>. However, I do not make any promises I can do
          something about it. I also do not have to give basic user support,
          and I hope the tool is mostly self-explanatory so that it is not needed.</p>
        <p>Some other schools have dedicated programmers whose main task is
           to build this kind of software that saves researchers and teachers
           valuable time. The fastest way to get the features you want might be
           to find a developer who can contribute the feature you need to this
           project, or who writes a separate tool. This an MIT-licensed
           open source tool, and useful contributions are welcome.</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'Welcome'
  }
</script>

<style scoped>
h3 {
  margin-top: 1em;
}

</style>