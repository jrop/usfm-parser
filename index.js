/* eslint-disable no-console */
require('loud-rejection')()
require('segfault-handler').registerHandler('crash.log')
const co = require('co')
const fs = require('fs')
const _ = require('lodash')

const parse = require('./parser')

co(function * () {
	const files = _.chain(yield done => fs.readdir(`${__dirname}/web`, done))
		.filter(d => /^\d+-/.test(d))
		.sortBy(s => parseInt(/^(\d+)/.exec(s)[1]))
		.filter(s => !/^(00|106)/.test(s))
		.filter(s => s == '56-PS2eng-web.usfm')
		.value()

	for (const file of files) {
		// if (file != '19-JOBeng-web.usfm')
		// 	continue
		console.log('Reading', file)
		const s = yield done => fs.readFile(`${__dirname}/web/${file}`, 'utf-8', done)
		process.stdout.write('\tparsing...')
		const ast = parse(s) // eslint-disable-line no-unused-vars
		console.log('done')
	}
})
