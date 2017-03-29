// http://ubs-icap.org/chm/usfm/2.4/index.html
import Lexer from 'perplex/lib/lexer'

export class UsfmLexer extends Lexer {
	constructor(s: string) {
		super(s)
	}
}