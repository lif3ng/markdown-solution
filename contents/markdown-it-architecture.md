# markdown-it 设计原则

[原文](https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md)

## 数据流 Data flow

输入数据经由规则 (rules) 嵌套链处理。有三个嵌套链：`core`, `block`, `inline`.

```
core
    core.rule1 (normalize)
    ...
    core.ruleX

    block
        block.rule1 (blockquote)
        ...
        block.ruleX

    core.ruleX1 (intermediate rule that applies on block tokens, nothing yet)
    ...
    core.ruleXX

    inline (applied to each block token with "inline" type)
        inline.rule1 (text)
        ...
        inline.ruleX

    core.ruleYY (applies to all tokens)
    ... (abbreviation, footnote, typographer, linkifier)

```

解析后的结果是一个 _token 列表_, 将通过 `renderer` 生成 HTML.

这些 token 能够将自身再次解析为更多的 token (如：一个 `list token` 可以被分解成多个 `inline tokens`).

`env` 沙盒可以与 token 一同使用，为解析器和渲染器注入外部变量。

每个链 (core / block / inline) 在解析数据时使用一个独立的 `state` 对象，因此每个解析操作都是独立的，可以随时禁用。

## Token stream

使用更底层的数据表示形式 _tokens_ 代替传统的 AST. 区别很简单:

- Tokens 是个简单序列 (Array).
- 开始标签和闭合标签是分离的。
- 特殊的 token 对象 "inline containers" 拥有嵌套的 tokens. 是内联标记 (bold, italic, text, ...) 的序列。

可以通过 [token class](https://github.com/markdown-it/markdown-it/blob/master/lib/token.js) 查看每个 token 项的详细信息。

token stream 是:

- 在顶级 - 成对的或单个 "block" tokens 的数组:
  - open/close for headers, lists, blockquotes, paragraphs, ...
  - codes, fenced blocks, horizontal rules, html blocks, inlines containers
- 每个 inline token 都有 `.children` 属性，带有 inline 内容的嵌套 token stream:
  - open/close for strong, em, link, code, ...
  - text, line breaks

为什么不用 AST? 遵循 KISS 原则，就我们的任务而言并不需要它。

如果你想，你不需要渲染器，调用解析器（parser）就能将 token stream 转换为 AST.

关于 token 的更多细节:

- [Renderer source](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
- [Token source](https://github.com/markdown-it/markdown-it/blob/master/lib/token.js)
- [Live demo](https://markdown-it.github.io/) - type your text and click `debug` tab.

## 规则 Rules

Rules 是一些函数, 围绕解析器 `state` 对象进行一些操作. 一条规则与一个或多个 _链条_ 相关联，并且是唯一的. 例如一个 `blockquote` token 与 `blockquote`, `paragraph`, `heading`, `list` 链相关联

规则经由 [Ruler](https://markdown-it.github.io/markdown-it/#Ruler) 实例，通过名称进行管理， 可以通过 [MarkdownIt](https://markdown-it.github.io/markdown-it/#MarkdownIt) 的方法 `enabled` / `disabled` 进行启用或禁用。

注意, 一些规则有 `validation mode` - 这种模式下，规则不能修改 token stream, and only look ahead for the end of a token. 这是个重要的设计模式 - a token stream is "write only" on block & inline parse stages.

解析器（Parsers） 被设计成使规则 (rules) 彼此独立。 你可以安全的启用/禁用他们，或者增加个新规则。
关于如何创建新规则没有通用的套路 —— 数据隔离良好的分布式状态机的设计是一项艰巨的任务 (design of distributed state machines with good data isolation is a tricky business).
你可以从现有的规则 (rule) 和插件 (plugin) 中探索可行性。

## 渲染器 Renderer

Token stream 生成之后, 将通过 [渲染器(renderer)](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
渲染器将遍历所有 token, 并将每个 token 传递给 token type 的同名规则 (rule).

渲染器规则位于 `md.renderer.rules[name]`, 是具有相同标识 (signature) 的简单函数。

```js
function (tokens, idx, options, env, renderer) {
  //...
  return htmlResult;
}
```

在许多场景下，即使没有侵入式解析也能轻松修改输出。
For example, let's replace images with vimeo links to player's iframe:
例如，使用指向 vimeo 链接的播放器 iframe 替换图片：

```js
var md = require("markdown-it")();

var defaultRender = md.renderer.rules.image,
  vimeoRE = /^https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;

md.renderer.rules.image = function (tokens, idx, options, env, self) {
  var token = tokens[idx],
    aIndex = token.attrIndex("src");

  if (vimeoRE.test(token.attrs[aIndex][1])) {
    var id = token.attrs[aIndex][1].match(vimeoRE)[2];

    return (
      '<div class="embed-responsive embed-responsive-16by9">\n' +
      '  <iframe class="embed-responsive-item" src="//player.vimeo.com/video/' +
      id +
      '"></iframe>\n' +
      "</div>\n"
    );
  }

  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self);
};
```

这还有一个例子, 为所有链接添加 `target="_blank"`:

```js
// Remember old renderer, if overridden, or proxy to default renderer
var defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  // If you are sure other plugins can't add `target` - drop check below
  var aIndex = tokens[idx].attrIndex("target");

  if (aIndex < 0) {
    tokens[idx].attrPush(["target", "_blank"]); // add new attribute
  } else {
    tokens[idx].attrs[aIndex][1] = "_blank"; // replace value of existing attr
  }

  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self);
};
```

注意，如果你需要增加属性, 可以在没有渲染器覆盖 (renderer override) 的情况下进行。

例如，你可以在 `core` 链上更新 token。这比直接覆盖渲染器要慢一些，但更简单。让我们用
[markdown-for-inline](https://github.com/markdown-it/markdown-it-for-inline) 插件
来完成上一个例子：

<!-- prettier-ignore -->
```js
var iterator = require('markdown-it-for-inline');

var md = require('markdown-it')()
            .use(iterator, 'url_new_win', 'link_open', function (tokens, idx) {
              var aIndex = tokens[idx].attrIndex('target');

              if (aIndex < 0) {
                tokens[idx].attrPush(['target', '_blank']);
              } else {
                tokens[idx].attrs[aIndex][1] = '_blank';
              }
            });
```

你也可以写自己的渲染器去生成 HTML 以为的其他格式，例如 JSON/XML... 甚至可以用它生成 AST.

## 总结

再次回顾下 数据流 中提到的流程:

1. Blocks 解析, 使用 block tokens 填充顶层 token stream.
2. Inline 容器内容, 使用 `.children` 属性填充.
3. 开始渲染.
