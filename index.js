require('dotenv').config()
const twitter = require('twitter');
const fetch = require('node-fetch');

const client = new twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

setInterval(function() {

  // Fetch quotes from API
  fetch("https://tintin-quotes-api.herokuapp.com/quotes/random")
  .then(res => res.json())
  .then(res => {
    const quote = res;

    const full_tweet = quote.text + "\n\n - " + quote.author;

    // If quotes is less than tweet character limit post tweet

    if (full_tweet.length < 280){
      client.post('statuses/update', {status: full_tweet},  function(error, tweet, response) {
        if(error) throw error;
      });
    }

  })
  .catch(err => console.log(err));


}, 10800000);
