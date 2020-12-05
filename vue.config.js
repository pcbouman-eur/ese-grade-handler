const path = require("path");

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  outputDir: path.resolve(__dirname, "docs"),
  publicPath: process.env.NODE_ENV === 'production' ? '/ese-grade-handler/' : '/',
  pages: {
    index: {
      entry: './src/main.js',
      title: 'ESE grade handler'
    }
  } 
}