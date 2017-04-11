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

function enclosed(parser: Parser, lex: UsfmLexer, bp: number, opener: string, closer: string = `${opener}*`, type: string = opener) {
	parser.builder()
		.bp(closer, -1)
		.either(opener, bp, (left, t, bp) => {
			const value = parser.parse(bp)
			lex.expect(closer)
			return arrify(left).concat({type: opener, value})
		})
}

export class UsfmParser extends Parser {
	constructor(lex: UsfmLexer) {
		super(lex)
		const builder = this.builder()
		builder.bp('$EOF', -1)
		builder.nud('TEXT', Number.MAX_VALUE, (t, bp) => [t.match.trim()])
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
		single(this, BP, 'b')
		single(this, BP, 'ili')
		single(this, BP, 'ili2')
		single(this, BP, 'li1')
		single(this, BP, 'm')
		single(this, BP, 'mi')
		single(this, BP, 'nb')
		single(this, BP, 'p')
		single(this, BP, 'pc')
		single(this, BP, 'pi1')
		single(this, BP, 'q1')
		single(this, BP, 'q2')

		value(this, lex, BP, 'cl')
		value(this, lex, BP, 'cp')
		value(this, lex, BP, 'd')
		value(this, lex, BP, 'h')
		value(this, lex, BP, 'id')
		value(this, lex, BP, 'ide')
		value(this, lex, BP, 'ip')
		value(this, lex, BP, 'is1')
		value(this, lex, BP, 'ms1')
		value(this, lex, BP, 'mt1')
		value(this, lex, BP, 'mt2')
		value(this, lex, BP, 'mt3')
		value(this, lex, BP, 's1')
		value(this, lex, BP, 'sp')
		value(this, lex, BP, 'toc1')
		value(this, lex, BP, 'toc2')
		value(this, lex, BP, 'toc3')

		BP += 10
		enclosed(this, lex, BP, 'add')
		enclosed(this, lex, BP, 'bk')
		enclosed(this, lex, BP, 'f')
		enclosed(this, lex, BP, 'k')
		enclosed(this, lex, BP, 'qs')
		enclosed(this, lex, BP, 'wj')
		enclosed(this, lex, BP, 'x')

		BP += 10
		enclosed(this, lex, BP, '+bk', '+bk*', 'bk')

		value(this, lex, BP, 'fl')
		value(this, lex, BP, 'fq')
		value(this, lex, BP, 'fr')
		value(this, lex, BP, 'ft')
		value(this, lex, BP, 'fqa')
		value(this, lex, BP, 'xo')
		value(this, lex, BP, 'xt')
	}
}
