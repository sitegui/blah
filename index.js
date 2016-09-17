'use strict'

let ejs = require('ejs-html'),
	html = require('fs').readFileSync('brasil.html', 'utf8'),
	parsed = ejs.parse(html),
	ignoreTags = ['script', 'link', 'meta', 'source', 'audio'],
	ignoreAttributes = ['id', 'class', 'aria', 'role', 'href', 'aria-labelledby', 'style', 'src', 'width', 'srcset', 'height', 'data-mw', 'rel', 'data-file-width', 'data-file-height', 'accesskey', 'colspan', 'scope', 'color', 'align', 'cellspacing', 'start', 'rowspan', 'dir', 'for', 'type', 'hreflang', 'cellpadding', 'name', 'action', 'lang', 'title']

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
				if (ignoreAttributes.indexOf(attribute.name) !== -1) {
					return
				}
				addText(attribute.value)
			})
		}
	})
}

let level = 5,
	total = 0,
	prefixTree = {},
	tree = {}

function addText(str) {
	str = str.toLowerCase().trim()
	let words = str.split(/[^'a-zàáâãäæéêëíóôõöúüç]+/).filter(Boolean)
	words.forEach(word => {
		total += 1
		word += '.'

		// Add to prefix tree
		let prefixNode = prefixTree
		for (let j = 0; j < level - 1 && j < word.length; j++) {
			let letter = word[j]
			if (!(letter in prefixNode)) {
				prefixNode[letter] = {
					num: 0,
					next: {}
				}
			}

			prefixNode[letter].num += 1
			prefixNode = prefixNode[letter].next
		}

		// Add to main tree
		for (let i = 0; i <= word.length - level; i++) {
			let node = tree
			for (let j = 0; j < level; j++) {
				let letter = word[i + j]
				if (!(letter in node)) {
					node[letter] = {
						num: 0,
						next: {}
					}
				}

				node[letter].num += 1
				node = node[letter].next
			}
		}
	})
}

function genWord() {
	let word = ''

	// Fill prefix
	let prefixNum = total,
		prefixNode = prefixTree
	for (let j = 1; j < level; j++) {
		let letter = pickNext(prefixNum, prefixNode)
		if (letter === '.') {
			return word
		}
		word += letter

		prefixNum = prefixNode[letter].num
		prefixNode = prefixNode[letter].next
	}

	// Fill rest
	while (true) {
		let num, node = tree

		for (let j = word.length - level + 1; j < word.length; j++) {
			let letter = word[j]
			num = node[letter].num
			node = node[letter].next
		}

		let letter = pickNext(num, node)
		if (letter === '.') {
			return word
		}
		word += letter
	}

	function pickNext(num, node) {
		let value = Math.floor(Math.random() * num)
		for (let letter in node) {
			let letterNum = node[letter].num
			if (value < letterNum) {
				return letter
			}
			value -= letterNum
		}
	}
}

collectText('', parsed)

let paragraphs = []
for (let i = 0; i < 5; i++) {
	let phrases = []
	for (let j = 5 + 5 * Math.random(); j >= 0; j--) {
		let words = []
		for (let k = 10 + 5 * Math.random(); k >= 0; k--) {
			words.push(genWord() + (k > 1 && Math.random() < 0.2 ? ',' : ''))
		}
		words[0] = words[0][0].toUpperCase() + words[0].substr(1)
		phrases.push(words.join(' '))
	}
	paragraphs.push(phrases.join('. '))
}
console.log(paragraphs.join('\n\n'))