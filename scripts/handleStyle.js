const fs = require("fs");
const path = require("path");
const stylus = require("stylus");

const stylusFileContent = fs
  .readFileSync(path.resolve(__dirname, "config/style.styl"))
  .toString();

module.exports = new Promise((resolve) =>
  stylus(stylusFileContent).render((err, result) => {
    if (err) {
      throw err.message;
    }
    resolve(result);
  })
);
