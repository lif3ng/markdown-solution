const fs = require("fs");
const path = require("path");
exports.appendToHtml = (fileName, ...appentContent) => {
  const filePath = path.join(__dirname, `../docs/${fileName}.html`);
  fs.writeFileSync(
    filePath,
    fs.readFileSync(filePath) + appentContent.join("\n")
  );
};
