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

const fileName = "markdown-it.md";
const content = fs
  .readFileSync(path.join(__dirname, "../contents", fileName))
  .toString();
const html = md.render(content);

fs.writeFileSync(
  path.join(__dirname, "../docs", fileName.replace(/\.md$/, ".html")),
  html
);
