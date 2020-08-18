const useMarkdownIt = require("./useMarkdownIt");
const getHtmlByContent = require("./useMarkdownIt").getHtmlByContent;
const sideBarList = require("./config/sidebar");
const appendToHtml = require("./htmlUtils").appendToHtml;
const generateCss = require("./handleStyle");

const articleList = [];

sideBarList.forEach((fileName) => {
  const title = useMarkdownIt(fileName);
  articleList.push({
    path: `${fileName}.html`,
    title,
  });
});

const sideBarHtml =
  '<div class="sidebar">' +
  getHtmlByContent(
    articleList.map(({ path, title }) => `- [${title}](${path})`).join("\n")
  ) +
  "</div>";

console.log(sideBarHtml);

generateCss.then((css) => {
  sideBarList.forEach((fileName) => {
    appendToHtml(fileName, sideBarHtml, `<style>${css}</style>`);
  });
});
