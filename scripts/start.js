const useMarkdownIt = require("./useMarkdownIt");
const { getHtmlByContent, writeTOC } = require("./useMarkdownIt");
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

const tocUlHtml = getHtmlByContent(
  articleList.map(({ path, title }) => `- [${title}](${path})`).join("\n")
);

writeTOC(tocUlHtml);

const sideBarHtml = '<div class="sidebar">' + tocUlHtml + "</div>";

generateCss.then((css) => {
  sideBarList.forEach((fileName) => {
    appendToHtml(fileName, sideBarHtml, `<style>${css}</style>`);
  });
});
