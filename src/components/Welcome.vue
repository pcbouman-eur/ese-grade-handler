<template>
  <v-container>
    <v-row align='center' justify='center'>
      <v-col cols="6">
        <h2>ESE Grade Handler</h2>
        <h3>Introduction</h3>
        <p>This is a tool that attempts to simplify a number of tasks that
           involve grades from students. Currently, there are two tasks it can
           help with: (1) combining student results from a number of different
           spreadsheet files or different sheets (tabs) within a file into
           a single table, and (2) injecting final course results into the
           official SPD spreadsheet format required to submit official grades.
           You can pick a tool you want to use at the top of the page, by
           clicking "Combiner" or "Injector".
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
            <li>At least one of the columns in a sheet must be a <em>key-colum</em>
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
        <h3>Is this safe?</h3>
        <p>All processing of grades happens solely within your web-browser,
          and no data is transmitted over the internet by this tool. Once
          this website is loaded in your browser, you can disconnect from the
          internet to handle your grades offline. If you don't believe this, 
          you can easily check this with the network activity inspector in your
          browser's developer tools, or by inspecting the <a href="https://github.com/pcbouman-eur/ese-grade-handler"
          target="blank">source code of this application</a>.</p>
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