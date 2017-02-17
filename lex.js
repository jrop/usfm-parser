'use strict'

const perplex = require('perplex')
module.exports = s => {
	const l = perplex()
		.token('TAG', /\\[a-z0-9]+\*?/i)
		.token('TEXT', /[^\\]+/)

	l.expectTag = function (tag) {
		const t = l.expect('TAG')
		if (t.match != tag)
			throw new Error(`Expected ${tag}, got ${t.match} (${l.pos(t)})`)
		return t
	}
	l.pos = function (t) {
		if (t.type == '$EOF')
			return 'EOF'
		const {start} = t.strpos()
		return `${start.line}:${start.column}`
	}

	l.source = s
	return l
}
