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

In total, a token stream is:

- On the top level - array of paired or single "block" tokens:
  - open/close for headers, lists, blockquotes, paragraphs, ...
  - codes, fenced blocks, horizontal rules, html blocks, inlines containers
- Each inline token have a `.children` property with a nested token stream for inline content:
  - open/close for strong, em, link, code, ...
  - text, line breaks
