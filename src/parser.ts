import * as arrify from 'arrify'
import {Parser, ParserBuilder, ILexer, LedFunction} from 'pratt'
import {UsfmLexer} from './lexer'

function single(parser: Parser, bp: number, type: string) {
	parser.builder()
		.nud(type, bp, (t, bp) => [{type}])
		.led(type, bp, (left, t, bp) => left.concat({type}))
}

function value(parser: Parser, lex: UsfmLexer, bp: number, type: string) {
	const builder = parser.builder()
	builder.nud(type, bp, (t, bp) => [{[type]: parser.parse(bp)}])
	builder.led(type, bp, (left, t, bp) => left.concat({[type]: parser.parse(bp)}))
}

function either(parser: Parser, bp: number, type: string, fn: LedFunction) {
	parser.builder()
		.nud(type, bp, (t, bp) => fn(undefined, t, bp))
		.led(type, bp, fn)
}

export class UsfmParser extends Parser {
	constructor(lex: UsfmLexer) {
		super(lex)
		const builder = this.builder()
		builder.bp('$EOF', -1)
		builder.nud('TEXT', Number.MAX_VALUE, (t, bp) => [t.match])
		builder.led('TEXT', Number.MAX_VALUE, (left, t, bp) => 
			left.concat(t.match.trim()))

		let BP = 10

		BP += 10
		builder.led('c', BP, (left, t, bp) => {
			const num = parseInt(lex.expect('TEXT').match.trim())
			const content = this.parse(bp)
			return left.concat({type: 'c', num, content})
		})

		BP += 10
		builder.led('v', BP, (left, t, bp) => {
			const text = lex.peek().match
			const num = /^\s*(\d+)\s*/.exec(text)
			lex.lexer.position += num[0].length
			return left.concat({type: 'v', num: parseInt(num[1]), value: this.parse(bp)})
		})
		
		BP += 10
		value(this, lex, BP, 'cp')
		value(this, lex, BP, 'd')
		value(this, lex, BP, 'h')
		value(this, lex, BP, 'id')
		value(this, lex, BP, 'ide')
		value(this, lex, BP, 'ip')
		value(this, lex, BP, 'toc1')
		value(this, lex, BP, 'toc2')
		value(this, lex, BP, 'toc3')
		value(this, lex, BP, 'mt1')
		value(this, lex, BP, 'mt2')
		value(this, lex, BP, 'mt3')
		single(this, BP, 'b')
		single(this, BP, 'nb')
		single(this, BP, 'p')
		single(this, BP, 'q1')
		single(this, BP, 'q2')

		BP += 10
		builder.bp('bk*', -1)
		either(this, BP, 'bk', (left, t, bp) => {
			const value = this.parse(bp)
			lex.expect('bk*')
			return arrify(left).concat({type: 'bk', value})
		})

		BP += 10
		builder.bp('f*', -1)
		either(this, BP, 'f', (left, t, bp) => {
			const value = this.parse(bp)
			lex.expect('f*')
			return arrify(left).concat({type: 'f', value})
		})

		BP += 10
		value(this, lex, BP, 'fr')
		value(this, lex, BP, 'ft')
	}
}

if (require.main === module) {
	const code = 'moo \\bk A book\\bk* goo'
	const parser = new UsfmParser(new UsfmLexer(code))
	const ast = parser.parse()
	console.log(require('util').inspect(ast, null, null))
}
