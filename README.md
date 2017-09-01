# usfm-parser (WIP)

[![Greenkeeper badge](https://badges.greenkeeper.io/jrop/usfm-parser.svg)](https://greenkeeper.io/)

A [USFM](http://paratext.org/about/usfm) parser for JavaScript (written in TypeScript).

## Installation

```sh
npm install --save usfm
# or
yarn add usfm
```

## Use

```js
import {UsfmLexer, UsfmParser} from 'usfm'

const parser = new UsfmParser(new UsfmLexer('...USFM string...'))
const ast = parser.parse()
```

## Current Status

This module is still in development and may be incomplete.  The current (limiting) goal is to parse the [World English Bible (WEB)](http://ebible.org/find/show.php?id=eng-web) USFM.  Since only a subset of the total USF markers are in use in the World English Bible, this parser is incomplete (not all tags are implemented).  However, [the parser is uber-simple](https://github.com/jrop/usfm-parser/blob/master/src/parser.ts#L33), which means that if it does not support a marker that you need, you should fork this repo, add the necessary parsing logic, and submit a pull-request.

TODO:
* tests are not implemented

## How the parser works

The parser is a [Pratt parser](https://github.com/jrop/pratt).  If you want to contribute to this repository, make sure you have read up on Pratt parsing.

## License

ISC License (ISC)
Copyright 2017 Jonathan Apodaca <jrapodaca@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
