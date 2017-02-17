'use strict'

const perplex = require('perplex')
module.exports = s => {
	const l = perplex()
		.token('TAG', /\\[a-z0-9]+\*?/i)
		.token('TEXT', /[^\\]+/)
	l.source = s
	return l
}
