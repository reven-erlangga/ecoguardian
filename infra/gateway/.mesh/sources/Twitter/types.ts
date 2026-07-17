// @ts-nocheck

import type { InContextSdkMethod } from '@graphql-mesh/types';

export namespace TwitterTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  /** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
  String: { input: string; output: string; }
  /** The `Boolean` scalar type represents `true` or `false`. */
  Boolean: { input: boolean; output: boolean; }
  /** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: { input: bigint; output: bigint; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  TransportOptions: { input: unknown; output: unknown; }
};

export type Query = {
  twitter_TwitterService_GetTweet?: Maybe<twitter__Tweet>;
  twitter_TwitterService_connectivityState?: Maybe<ConnectivityState>;
};


export type Querytwitter_TwitterService_GetTweetArgs = {
  input?: InputMaybe<twitter__GetTweetRequest_Input>;
};


export type Querytwitter_TwitterService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
};

export type twitter__Tweet = {
  id?: Maybe<Scalars['String']['output']>;
  tweet_id?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  author?: Maybe<Scalars['String']['output']>;
  author_username?: Maybe<Scalars['String']['output']>;
  media_urls?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  created_at?: Maybe<common__Timestamp>;
  metadata?: Maybe<Scalars['JSON']['output']>;
};

export type common__Timestamp = {
  seconds?: Maybe<Scalars['BigInt']['output']>;
  nanos?: Maybe<Scalars['Int']['output']>;
};

export type twitter__GetTweetRequest_Input = {
  id?: InputMaybe<Scalars['String']['input']>;
};

export type ConnectivityState =
  | 'IDLE'
  | 'CONNECTING'
  | 'READY'
  | 'TRANSIENT_FAILURE'
  | 'SHUTDOWN';

export type Mutation = {
  twitter_TwitterService_IngestTweet?: Maybe<twitter__IngestTweetResponse>;
  twitter_TwitterService_QueryTweets?: Maybe<twitter__QueryTweetsResponse>;
};


export type Mutationtwitter_TwitterService_IngestTweetArgs = {
  input?: InputMaybe<twitter__IngestTweetRequest_Input>;
};


export type Mutationtwitter_TwitterService_QueryTweetsArgs = {
  input?: InputMaybe<twitter__QueryTweetsRequest_Input>;
};

export type twitter__IngestTweetResponse = {
  id?: Maybe<Scalars['String']['output']>;
};

export type twitter__IngestTweetRequest_Input = {
  tweet_id?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  author?: InputMaybe<Scalars['String']['input']>;
  author_username?: InputMaybe<Scalars['String']['input']>;
  media_urls?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  created_at?: InputMaybe<common__Timestamp_Input>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
};

export type common__Timestamp_Input = {
  seconds?: InputMaybe<Scalars['BigInt']['input']>;
  nanos?: InputMaybe<Scalars['Int']['input']>;
};

export type twitter__QueryTweetsResponse = {
  tweets?: Maybe<Array<Maybe<twitter__Tweet>>>;
  pagination?: Maybe<common__PaginationResponse>;
};

export type common__PaginationResponse = {
  page?: Maybe<Scalars['Int']['output']>;
  per_page?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type twitter__QueryTweetsRequest_Input = {
  author?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  classification_label?: InputMaybe<Scalars['String']['input']>;
  start_date?: InputMaybe<common__Timestamp_Input>;
  end_date?: InputMaybe<common__Timestamp_Input>;
  pagination?: InputMaybe<common__Pagination_Input>;
};

export type common__Pagination_Input = {
  page?: InputMaybe<Scalars['Int']['input']>;
  per_page?: InputMaybe<Scalars['Int']['input']>;
};

  export type QuerySdk = {
      
  twitter_TwitterService_GetTweet: InContextSdkMethod<Query['twitter_TwitterService_GetTweet'], Querytwitter_TwitterService_GetTweetArgs, BaseMeshContext>,
  
  twitter_TwitterService_connectivityState: InContextSdkMethod<Query['twitter_TwitterService_connectivityState'], Querytwitter_TwitterService_connectivityStateArgs, BaseMeshContext>
  };

  export type MutationSdk = {
      
  twitter_TwitterService_IngestTweet: InContextSdkMethod<Mutation['twitter_TwitterService_IngestTweet'], Mutationtwitter_TwitterService_IngestTweetArgs, BaseMeshContext>,
  
  twitter_TwitterService_QueryTweets: InContextSdkMethod<Mutation['twitter_TwitterService_QueryTweets'], Mutationtwitter_TwitterService_QueryTweetsArgs, BaseMeshContext>
  };

  export type SubscriptionSdk = {
    
  };

  export type Context = {
      ["Twitter"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
