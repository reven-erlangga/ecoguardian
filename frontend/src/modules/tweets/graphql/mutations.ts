export const INGEST_TWEET = `mutation($input: twitter_IngestTweetRequest_Input) {
  twitter_TwitterService_IngestTweet(input: $input) {
    id tweet_id
  }
}`;
