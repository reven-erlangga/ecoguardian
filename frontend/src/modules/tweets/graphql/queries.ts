export const QUERY_TWEETS = `query($input: twitter_ListTweetsRequest_Input) {
  twitter_TwitterService_ListTweets(input: $input) {
    tweets { id tweet_id text paraphrased_text author author_username media_urls created_at classification { text { label confidence } image { label confidence } } location { lat lon address } }
    total
  }
}`;

export const GET_TWEET = `query($id: String!) {
  twitter_TwitterService_GetTweet(input: { id: $id }) {
    id tweet_id text paraphrased_text author author_username media_urls created_at classification { text { label confidence } image { label confidence } } location { lat lon address }
  }
}`;
