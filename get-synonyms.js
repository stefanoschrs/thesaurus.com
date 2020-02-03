'use strict'

const https = require('https')

const baseUrl = 'https://www.thesaurus.com/browse/'

/**
 * Get synonyms
 * @param {string} searchTerm - Search term
 * @param {string} [outputType=json] - Output type
 * @returns {Promise<string>}
 */
function main (searchTerm, outputType) {
  return new Promise((resolve, reject) => {
    const req = https.get(baseUrl + searchTerm, (res) => {
      let data = ''

      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        if (data.includes('/misspelling')) {
          resolve('no results')
          return
        }

        let words = new Set()
        data
          .match(/"term"\s*:\s*"[^"]*/g)
          .forEach((el) => words.add(el.replace(/"term"\s*:/, '').replace(/"/g, '').toLowerCase()))

        const wordsArr = Array.from(words).sort()
        let result
        if (outputType === 'csv') {
          result = wordsArr.join(',')
        } else {
          result = JSON.stringify(wordsArr)
        }

        resolve(result)
      })
    })
    req.on('error', (err) => reject(err))
  })
}

if (!module.parent) {
  main(process.argv[2], process.argv[3])
    .then(console.log)
    .catch(console.error)
}

module.exports = main