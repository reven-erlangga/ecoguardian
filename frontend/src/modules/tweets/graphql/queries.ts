export const QUERY_TWEETS = `query($input: twitter__QueryTweetsRequest_Input) {
  twitter_TwitterService_QueryTweets(input: $input) {
    tweets {
      id
      tweet_id
      text
      author
      author_username
      media_urls
      created_at { seconds nanos }
      metadata
    }
    pagination { page per_page total }
  }
}`;

export const GET_TWEET = `query($input: twitter__GetTweetRequest_Input) {
  twitter_TwitterService_GetTweet(input: $input) {
    id
    tweet_id
    text
    author
    author_username
    media_urls
    created_at { seconds nanos }
    metadata
  }
}`;
