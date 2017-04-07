import fs = require('fs')
import thunk = require('thunk-to-promise')
import _ = require('lodash')

import {UsfmLexer} from './lexer'
import {UsfmParser} from './parser'

async function main() {
	try {
		const files = _.chain(await thunk(done => fs.readdir(`${__dirname}/../web`, done)))
			.filter(d => /^\d+-/.test(d))
			.sortBy(s => parseInt(/^(\d+)/.exec(s)[1]))
			.filter(s => !/^(00|106)/.test(s))
			// .filter((s: string) => s.startsWith('03')) // '56-PS2eng-web.usfm')
			.value()

		for (const file of files) {
			// if (file != '19-JOBeng-web.usfm')
			// 	continue
			console.log('Reading', file)
			const s = await thunk(done => fs.readFile(`${__dirname}/../web/${file}`, 'utf-8', done))
			process.stdout.write('\tparsing...')
			const parser = new UsfmParser(new UsfmLexer(s))
			const ast = parser.parse()
			// console.log(require('util').inspect(ast, null, null))
			console.log('done')
		}
	} catch (e) {
		console.error(e)
		process.exitCode = 1
	}
}
main()
