# markdown-it

[代码仓库](https://github.com/markdown-it/markdown-it)

[API 文档](https://markdown-it.github.io/markdown-it/)

[Demo](https://markdown-it.github.io)

- 遵循 **[CommonMark 标准](http://spec.commonmark.org/)**
- 增加 语法扩展 和 语法糖 (URL autolinking, typographer).
- 可配置语法。可以添加新规则（rule），甚至替换现有规则。

## 安装

### Node.js

```
npm install markdown-it --save
```

### 浏览器 CDN 引入

## 使用

### 基本使用

```js
// node.js, 经典方式:
var MarkdownIt = require("markdown-it"),
  md = new MarkdownIt();
var result = md.render("# markdown-it rulezz!"); // '<h1>markdown-it rulezz!</h1>\n'

// node.js, 语法糖方式:
var md = require("markdown-it")();
var result = md.render("# markdown-it rulezz!");

// 单行渲染，没有 `<p>` 包裹
var md = require("markdown-it")();
var result = md.renderInline("__markdown-it__ rulezz!"); // '<strong>markdown-it</strong> rulezz!'
```

### 通过预置（presets）和选项（options）初始化

预置定义了规则（rules) 和选项（options）的组合，可选值为: `"commonmark"`, `"zero"`, `"default"`(不传入参数)

```js
// commonmark mode
var md = require("markdown-it")("commonmark");

// default mode
var md = require("markdown-it")();

// enable everything
var md = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true,
});
```

| options     |             commonmark             |    zero     |   default   |
| ----------- | :--------------------------------: | :---------: | :---------: |
| html        |                 ✅                 |             |             |
| xhtmlOut    |                 ✅                 |             |             |
| breaks      |                                    |             |             |
| langPrefix  |            'language-'             | 'language-' | 'language-' |
| linkify     |                                    |             |             |
| typographer |                                    |             |             |
| quotes      | '\u201c\u201d\u2018\u2019' -> “”‘’ |    “”‘’     |    “”‘’     |
| highlight   |                null                |    null     |    null     |

## preset

- [`commonmark`](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) 严格遵循 [CommonMark](https://commonmark.org/) 模式
- [`default`](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) 与 GFM 类似，未指定 preset 名称时使用。启用所有可用规则，但不支持 html、typographer 和 autolinker.
- [`zero`](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) 禁用所有规则. 可通过 `.enable()` 快速设置。比如在只需要加粗倾斜时使用。
