'use strict'

let ejs = require('ejs-html'),
	html = require('fs').readFileSync('brasil.html', 'utf8'),
	parsed = ejs.parse(html),
	ignoreTags = ['script', 'link', 'meta', 'source', 'audio'],
	ignoreAttributes = {
		'*': ['id', 'class', 'aria', 'role', 'href', 'aria-labelledby', 'style', 'src', 'width', 'srcset', 'height', 'data-mw', 'rel', 'data-file-width', 'data-file-height', 'accesskey', 'colspan', 'scope', 'color', 'align', 'cellspacing', 'start', 'rowspan', 'dir', 'for', 'type', 'hreflang', 'cellpadding', 'name', 'action', 'lang']
	}

function collectText(path, tokens) {
	tokens.forEach(token => {
		if (token.type === 'text') {
			addText(token.content)
		} else if (token.type === 'element') {
			if (ignoreTags.indexOf(token.name) !== -1) {
				return
			}

			let lang = token.attributes.find(attribute => attribute.name === 'lang')
			if (lang && lang.value !== 'pt') {
				return
			}

			collectText(path + token.name + '/', token.children)

			token.attributes.forEach(attribute => {
				if (ignoreAttributes['*'].indexOf(attribute.name) !== -1) {
					return
				}
				addText(attribute.value)
			})
		}
	})
}

// chars = \t\n\r !"#$%&'()*+,-./0123456789:;=?ABCDEFGHIJKLMNOPQRSTUVWXYZ[]_abcdefghijklmnopqrstuvwxyz{|}~§ª«°²·º»āǎɐɔəɛɨɫɻɾˈ‐–—•↑−

let allWords = new Set

function addText(str) {
	str = str.toLowerCase().trim()
	let words = str.split(/[^'a-zÁÂÃàáâãäæÉéêëÍíÓÔóôõöÚúüÇç\-ªº]+/).filter(Boolean)
	words.forEach(w => allWords.add(w))
}

collectText('', parsed)
console.log(Array.from(allWords).sort())