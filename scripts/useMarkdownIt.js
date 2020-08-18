const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  breaks: true,
  langPrefix: "lang-",
  linkify: true,
});

module.exports = (originFileName) => {
  const fileName = /\.md$/.test(originFileName)
    ? originFileName
    : `${originFileName}.md`;
  const content = fs
    .readFileSync(path.join(__dirname, "../contents", fileName))
    .toString();
  const html = md.render(content);

  fs.writeFileSync(
    path.join(__dirname, "../docs", fileName.replace(/\.md$/, ".html")),
    html
  );
  console.log(`${fileName} build done`);
  const titleMatch = content.match(/^#+\s+(.*)/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  return "_no_title_";
};

module.exports.getHtmlByContent = (content) => md.render(content);
