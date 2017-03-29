import {Parser, ILexer} from 'pratt'

export class UsfmParser extends Parser {
	constructor(lex: ILexer) {
		super(lex)
	}
}
