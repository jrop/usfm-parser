'use strict'

const assert = require('assert')
const debug = require('debug')('parser')
const lexer = require('./lex')

function expectTag(tag, lex) {
	const t = lex.expect('TAG')
	if (t.match != tag)
		throw new Error(`Expected ${tag}, got ${t.match} (${pos(t)})`)
	return t
}

function pos(t) {
	if (t.type == '$EOF')
		return 'EOF'
	const {start} = t.strpos()
	return `${start.line}:${start.column}`
}

function parse(s) {
	debug(`parse(${s.length} chars)`)
	const lex = lexer(s)
	lex.expectTag = t => expectTag(t, lex)
	const file = {}
	file.meta = meta(lex)
	file.chapters = chapters(lex)
	return file
}

function meta(lex) {
	debug('meta')
	const m = {}
	let next
	while (true) {
		next = lex.peek()
		if (next.type == 'TAG' && next.match == '\\c')
			break

		lex.next() // consume
		switch (next.match) {
		case '\\h':
			m.title = lex.next().match.trim()
			break
		default:
			lex.next() // eat
		}
	} // while
	return m
}

function chapters(lex) {
	const chaps = []
	do {
		let c = lex.next()
		if (c.type == '$EOF') break
		assert(c.type == 'TAG' && c.match == '\\c', `Expected chapter, got: ${c.match}`)

		const num = parseInt(lex.expect('TEXT').match.trim())
		debug('chapter', num)
		const contents = chapterContents(lex)
		chaps.push({num, contents})
	} while (true)
	return chaps
}

function chapterContents(lex) {
	debug('chapter:contents')
	const contents = []
	do {
		let t = lex.peek()
		if (t.type == 'TAG' && t.match == '\\c' || t.type == '$EOF') break

		const markers = ['\\b', '\\d', '\\ms1', '\\nb', '\\p', '\\pi1', '\\q1', '\\s1', '\\sp']
		switch (t.match) {
		case '\\cp':
			lex.next()
			lex.expect('TEXT')
			break
		case '\\f':
			contents.push(footnote(lex))
			break
		case '\\v':
			contents.push(verse(lex))
			break
		default:
			lex.next()
			if (t.type == 'TEXT' && t.match.trim() == '') continue
			if (markers.includes(t.match)) {
				contents.push({type: t.match.replace(/^\\/, '')})
				if (lex.peek().type == 'TEXT')
					lex.next()
			} else
				throw new Error(`Unexepected in chapter (${pos(t)}): ${t.match}`)
		}
	} while (true)
	return contents
}

function verse(lex) {
	lex.expectTag('\\v')

	const tokens = []
	const firstText = lex.expect('TEXT').match.trim()
	const num = parseInt(firstText.substr(0, firstText.indexOf(' ')))
	tokens.push(firstText.substr(firstText.indexOf(' ')).trim())
	debug('verse', num)
	do {
		const t = lex.peek()
		if (t.type == '$EOF' || t.type == 'TAG' && ['\\v', '\\c'].includes(t.match))
			break

		debug(t.match)
		const markers = ['\\b', '\\d', '\\li1', '\\m', '\\mi', '\\p', '\\pc', '\\pi1', '\\q', '\\q1', '\\q2', '\\qs', '\\sp']

		if (t.type == 'TAG') {
			switch (t.match) {
			case '\\add':
				lex.next()
				tokens.push({type: 'add', text: lex.expect('TEXT').match.trim()})
				lex.expectTag('\\add*')
				break
			case '\\f':
				tokens.push(footnote(lex))
				break
			case '\\qs':
				lex.next()
				tokens.push({type: 'qs', text: lex.expect('TEXT').match.trim()})
				lex.expectTag('\\qs*')
				break
			case '\\x':
				tokens.push(crossReference(lex))
				break
			default:
				if (markers.includes(t.match)) {
					tokens.push({type: t.match.replace(/^\\/, '')})
					lex.next()
				} else
					throw new Error(`Unkown tag encountered within verse: ${t.match} (${pos(t)})`)
			}
		} else {
			tokens.push(t.match.trim())
				lex.next()
		}
	} while (true)
	return {type: 'verse', num, tokens}
}

function footnote(lex) {
	debug('footnote')
	lex.expectTag('\\f')
	lex.expect('TEXT') // '+'
	lex.expectTag('\\fr')
	const ref = lex.expect('TEXT').match.trim()

	let text = ''
	do {
		if (lex.peek().match == '\\f*') break
		const t = lex.next()
		if (t.type == 'TAG') continue
		else text += t.match
	} while (true)

	const fend = lex.expectTag('\\f*')
	return {type: 'f', ref, text}
}

function crossReference(lex) {
	lex.expectTag('\\x')
	lex.expect('TEXT') // '+'
	lex.expectTag('\\xo')
	const curr = lex.expect('TEXT').match.trim()
	lex.expectTag('\\xt')
	const ref = lex.expect('TEXT').match.trim()
	lex.expectTag('\\x*')
	return {type: 'x', curr, ref}
}

module.exports = parse
