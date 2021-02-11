// require modules
require('dotenv').config()
const twitter = require('twitter')
const fetch = require('node-fetch')

// authenticate twitter
const client = new twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

// Fetch quotes from API
fetch('https://tintin-quotes-api.herokuapp.com/quotes/random')
	.then((res) => res.json())
	.then((res) => {
		const { quotes } = res
		const { quoteText, author, source, tags } = quotes[0]

		let hashtags = ``
		for (let i = 0; i < tags.length; i++) {
			hashtags += `#${tags[i]} `
		}

		const full_tweet = `${quoteText}

        - ${author}${source ? ',' : ''} ${source}

${hashtags}
        `

		// If quotes is less than tweet character limit post tweet

		//If tweet length is shorter than allowed limit  (280) characters then tweet directly
		if (full_tweet.length < 280) {
			client.post(
				'statuses/update',
				{ status: full_tweet },
				function (error, tweet, response) {
					if (error) throw error
					console.log('Tweeted: ' + full_tweet)
				}
			)
		} else {
			// Split into 280 character fragments
			const words = full_tweet.split(' ')
			const quoteFragments = []
			let quoteFragment = ''

			words.forEach((word) => {
				quoteFragment += word + ' '
				if (quoteFragment.length > 200) {
					quoteFragments.push(quoteFragment)
					quoteFragment = ' '
				}
			})

			quoteFragments.push(quoteFragment)

			for (let i = 0; i < quoteFragments.length - 1; i++) {
				quoteFragments[i] += '.....'
			}

			console.log(quoteFragments)

			var prev_id = null

			//Tweet quote as thread
			async function updateFeed() {
				for (item of quoteFragments) {
					console.log('Previous Tweet ID: ' + prev_id)
					let tweet = await client.post('statuses/update', {
						status: item,
						in_reply_to_status_id: prev_id
					})

					prev_id = tweet.id_str
					console.log(tweet.text)
				}

				console.log('done')
			}

			updateFeed()
		}
	})
	.catch((err) => console.log(err))
