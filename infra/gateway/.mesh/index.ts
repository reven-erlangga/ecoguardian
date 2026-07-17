// @ts-nocheck
import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { defaultImportFn, handleImport } from '@graphql-mesh/utils';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import type { MeshResolvedSource } from '@graphql-mesh/runtime';
import type { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh, type ExecuteMeshFn, type SubscribeMeshFn, type MeshContext as BaseMeshContext, type MeshInstance } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import type { ImportFn } from '@graphql-mesh/types';
import type { ClassificationTypes } from './sources/Classification/types';
import type { UserTypes } from './sources/User/types';
import type { NotificationTypes } from './sources/Notification/types';
import type { TwitterTypes } from './sources/Twitter/types';
import type { NlpTypes } from './sources/NLP/types';
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
  /** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
  Float: { input: number; output: number; }
  /** The `Byte` scalar type represents byte value as a Buffer */
  Byte: { input: Buffer | string; output: Buffer | string; }
  TransportOptions: { input: unknown; output: unknown; }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: { input: bigint; output: bigint; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  common__Empty: { input: any; output: any; }
};

export type Query = {
  classification_ClassificationService_connectivityState?: Maybe<ConnectivityState>;
  user_UserService_GetUser?: Maybe<user__User>;
  user_UserService_connectivityState?: Maybe<ConnectivityState>;
  user_AuthService_connectivityState?: Maybe<ConnectivityState>;
  twitter_TwitterService_GetTweet?: Maybe<twitter__Tweet>;
  twitter_TwitterService_connectivityState?: Maybe<ConnectivityState>;
  notification_NotificationService_GetNotifications?: Maybe<notification__GetNotificationsResponse>;
  notification_NotificationService_connectivityState?: Maybe<ConnectivityState>;
  nlp_NLPService_connectivityState?: Maybe<ConnectivityState>;
};


export type Queryclassification_ClassificationService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
};


export type Queryuser_UserService_GetUserArgs = {
  input?: InputMaybe<user__GetUserRequest_Input>;
};


export type Queryuser_UserService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
};


export type Queryuser_AuthService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
};


export type Querytwitter_TwitterService_GetTweetArgs = {
  input?: InputMaybe<twitter__GetTweetRequest_Input>;
};


export type Querytwitter_TwitterService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
};


export type Querynotification_NotificationService_GetNotificationsArgs = {
  input?: InputMaybe<notification__GetNotificationsRequest_Input>;
};


export type Querynotification_NotificationService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
};


export type Querynlp_NLPService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Mutation = {
  classification_ClassificationService_ClassifyImage?: Maybe<classification__ClassifyImageResponse>;
  user_UserService_Register?: Maybe<user__RegisterResponse>;
  user_UserService_Login?: Maybe<user__LoginResponse>;
  user_UserService_UpdateUser?: Maybe<user__User>;
  user_AuthService_ValidateToken?: Maybe<user__ValidateTokenResponse>;
  user_AuthService_RefreshToken?: Maybe<user__RefreshTokenResponse>;
  twitter_TwitterService_IngestTweet?: Maybe<twitter__IngestTweetResponse>;
  twitter_TwitterService_QueryTweets?: Maybe<twitter__QueryTweetsResponse>;
  notification_NotificationService_SendNotification?: Maybe<notification__SendNotificationResponse>;
  notification_NotificationService_MarkRead?: Maybe<Scalars['common__Empty']['output']>;
  nlp_NLPService_AnalyzeText?: Maybe<nlp__AnalyzeTextResponse>;
  nlp_NLPService_Geocode?: Maybe<nlp__GeocodeResponse>;
};


export type Mutationclassification_ClassificationService_ClassifyImageArgs = {
  input?: InputMaybe<classification__ClassifyImageRequest_Input>;
};


export type Mutationuser_UserService_RegisterArgs = {
  input?: InputMaybe<user__RegisterRequest_Input>;
};


export type Mutationuser_UserService_LoginArgs = {
  input?: InputMaybe<user__LoginRequest_Input>;
};


export type Mutationuser_UserService_UpdateUserArgs = {
  input?: InputMaybe<user__UpdateUserRequest_Input>;
};


export type Mutationuser_AuthService_ValidateTokenArgs = {
  input?: InputMaybe<user__ValidateTokenRequest_Input>;
};


export type Mutationuser_AuthService_RefreshTokenArgs = {
  input?: InputMaybe<user__RefreshTokenRequest_Input>;
};


export type Mutationtwitter_TwitterService_IngestTweetArgs = {
  input?: InputMaybe<twitter__IngestTweetRequest_Input>;
};


export type Mutationtwitter_TwitterService_QueryTweetsArgs = {
  input?: InputMaybe<twitter__QueryTweetsRequest_Input>;
};


export type Mutationnotification_NotificationService_SendNotificationArgs = {
  input?: InputMaybe<notification__SendNotificationRequest_Input>;
};


export type Mutationnotification_NotificationService_MarkReadArgs = {
  input?: InputMaybe<notification__MarkReadRequest_Input>;
};


export type Mutationnlp_NLPService_AnalyzeTextArgs = {
  input?: InputMaybe<nlp__AnalyzeTextRequest_Input>;
};


export type Mutationnlp_NLPService_GeocodeArgs = {
  input?: InputMaybe<nlp__GeocodeRequest_Input>;
};

export type ConnectivityState =
  | 'IDLE'
  | 'CONNECTING'
  | 'READY'
  | 'TRANSIENT_FAILURE'
  | 'SHUTDOWN';

export type classification__ClassifyImageResponse = {
  result?: Maybe<classification__ClassificationResult>;
};

export type classification__ClassificationResult = {
  label?: Maybe<Scalars['String']['output']>;
  confidence?: Maybe<Scalars['Float']['output']>;
  candidates?: Maybe<Array<Maybe<classification__LabelScore>>>;
};

export type classification__LabelScore = {
  label?: Maybe<Scalars['String']['output']>;
  confidence?: Maybe<Scalars['Float']['output']>;
};

export type classification__ClassifyImageRequest_Input = {
  image_data?: InputMaybe<Scalars['Byte']['input']>;
  image_format?: InputMaybe<Scalars['String']['input']>;
  tweet_id?: InputMaybe<Scalars['String']['input']>;
};

export type user__User = {
  id?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<common__Timestamp>;
  updated_at?: Maybe<common__Timestamp>;
};

export type common__Timestamp = {
  seconds?: Maybe<Scalars['BigInt']['output']>;
  nanos?: Maybe<Scalars['Int']['output']>;
};

export type user__GetUserRequest_Input = {
  id?: InputMaybe<Scalars['String']['input']>;
};

export type user__RegisterResponse = {
  user?: Maybe<user__User>;
  token?: Maybe<Scalars['String']['output']>;
};

export type user__RegisterRequest_Input = {
  email?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type user__LoginResponse = {
  user?: Maybe<user__User>;
  token?: Maybe<Scalars['String']['output']>;
};

export type user__LoginRequest_Input = {
  email?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};

export type user__UpdateUserRequest_Input = {
  id?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type user__ValidateTokenResponse = {
  user_id?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
};

export type user__ValidateTokenRequest_Input = {
  token?: InputMaybe<Scalars['String']['input']>;
};

export type user__RefreshTokenResponse = {
  token?: Maybe<Scalars['String']['output']>;
};

export type user__RefreshTokenRequest_Input = {
  token?: InputMaybe<Scalars['String']['input']>;
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

export type twitter__GetTweetRequest_Input = {
  id?: InputMaybe<Scalars['String']['input']>;
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

export type notification__GetNotificationsResponse = {
  notifications?: Maybe<Array<Maybe<notification__Notification>>>;
  pagination?: Maybe<common__PaginationResponse>;
};

export type notification__Notification = {
  id?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  channel?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  content?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<common__Timestamp>;
  read_at?: Maybe<common__Timestamp>;
};

export type notification__GetNotificationsRequest_Input = {
  user_id?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<common__Pagination_Input>;
};

export type notification__SendNotificationResponse = {
  id?: Maybe<Scalars['String']['output']>;
};

export type notification__SendNotificationRequest_Input = {
  user_id?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  channel?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
};

export type notification__MarkReadRequest_Input = {
  id?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

export type nlp__AnalyzeTextResponse = {
  label?: Maybe<Scalars['String']['output']>;
  confidence?: Maybe<Scalars['Float']['output']>;
  extracted_address?: Maybe<Scalars['String']['output']>;
  paraphrased_text?: Maybe<Scalars['String']['output']>;
};

export type nlp__AnalyzeTextRequest_Input = {
  text?: InputMaybe<Scalars['String']['input']>;
};

export type nlp__GeocodeResponse = {
  lat?: Maybe<Scalars['Float']['output']>;
  lon?: Maybe<Scalars['Float']['output']>;
  display_name?: Maybe<Scalars['String']['output']>;
};

export type nlp__GeocodeRequest_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  ConnectivityState: ConnectivityState;
  classification__ClassifyImageResponse: ResolverTypeWrapper<classification__ClassifyImageResponse>;
  classification__ClassificationResult: ResolverTypeWrapper<classification__ClassificationResult>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  classification__LabelScore: ResolverTypeWrapper<classification__LabelScore>;
  classification__ClassifyImageRequest_Input: classification__ClassifyImageRequest_Input;
  Byte: ResolverTypeWrapper<Scalars['Byte']['output']>;
  TransportOptions: ResolverTypeWrapper<Scalars['TransportOptions']['output']>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  user__User: ResolverTypeWrapper<user__User>;
  common__Timestamp: ResolverTypeWrapper<common__Timestamp>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']['output']>;
  user__GetUserRequest_Input: user__GetUserRequest_Input;
  user__RegisterResponse: ResolverTypeWrapper<user__RegisterResponse>;
  user__RegisterRequest_Input: user__RegisterRequest_Input;
  user__LoginResponse: ResolverTypeWrapper<user__LoginResponse>;
  user__LoginRequest_Input: user__LoginRequest_Input;
  user__UpdateUserRequest_Input: user__UpdateUserRequest_Input;
  user__ValidateTokenResponse: ResolverTypeWrapper<user__ValidateTokenResponse>;
  user__ValidateTokenRequest_Input: user__ValidateTokenRequest_Input;
  user__RefreshTokenResponse: ResolverTypeWrapper<user__RefreshTokenResponse>;
  user__RefreshTokenRequest_Input: user__RefreshTokenRequest_Input;
  twitter__Tweet: ResolverTypeWrapper<twitter__Tweet>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  twitter__GetTweetRequest_Input: twitter__GetTweetRequest_Input;
  twitter__IngestTweetResponse: ResolverTypeWrapper<twitter__IngestTweetResponse>;
  twitter__IngestTweetRequest_Input: twitter__IngestTweetRequest_Input;
  common__Timestamp_Input: common__Timestamp_Input;
  twitter__QueryTweetsResponse: ResolverTypeWrapper<twitter__QueryTweetsResponse>;
  common__PaginationResponse: ResolverTypeWrapper<common__PaginationResponse>;
  twitter__QueryTweetsRequest_Input: twitter__QueryTweetsRequest_Input;
  common__Pagination_Input: common__Pagination_Input;
  notification__GetNotificationsResponse: ResolverTypeWrapper<notification__GetNotificationsResponse>;
  notification__Notification: ResolverTypeWrapper<notification__Notification>;
  notification__GetNotificationsRequest_Input: notification__GetNotificationsRequest_Input;
  notification__SendNotificationResponse: ResolverTypeWrapper<notification__SendNotificationResponse>;
  notification__SendNotificationRequest_Input: notification__SendNotificationRequest_Input;
  common__Empty: ResolverTypeWrapper<Scalars['common__Empty']['output']>;
  notification__MarkReadRequest_Input: notification__MarkReadRequest_Input;
  nlp__AnalyzeTextResponse: ResolverTypeWrapper<nlp__AnalyzeTextResponse>;
  nlp__AnalyzeTextRequest_Input: nlp__AnalyzeTextRequest_Input;
  nlp__GeocodeResponse: ResolverTypeWrapper<nlp__GeocodeResponse>;
  nlp__GeocodeRequest_Input: nlp__GeocodeRequest_Input;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: Record<PropertyKey, never>;
  Mutation: Record<PropertyKey, never>;
  classification__ClassifyImageResponse: classification__ClassifyImageResponse;
  classification__ClassificationResult: classification__ClassificationResult;
  Float: Scalars['Float']['output'];
  classification__LabelScore: classification__LabelScore;
  classification__ClassifyImageRequest_Input: classification__ClassifyImageRequest_Input;
  Byte: Scalars['Byte']['output'];
  TransportOptions: Scalars['TransportOptions']['output'];
  String: Scalars['String']['output'];
  Boolean: Scalars['Boolean']['output'];
  Int: Scalars['Int']['output'];
  user__User: user__User;
  common__Timestamp: common__Timestamp;
  BigInt: Scalars['BigInt']['output'];
  user__GetUserRequest_Input: user__GetUserRequest_Input;
  user__RegisterResponse: user__RegisterResponse;
  user__RegisterRequest_Input: user__RegisterRequest_Input;
  user__LoginResponse: user__LoginResponse;
  user__LoginRequest_Input: user__LoginRequest_Input;
  user__UpdateUserRequest_Input: user__UpdateUserRequest_Input;
  user__ValidateTokenResponse: user__ValidateTokenResponse;
  user__ValidateTokenRequest_Input: user__ValidateTokenRequest_Input;
  user__RefreshTokenResponse: user__RefreshTokenResponse;
  user__RefreshTokenRequest_Input: user__RefreshTokenRequest_Input;
  twitter__Tweet: twitter__Tweet;
  JSON: Scalars['JSON']['output'];
  twitter__GetTweetRequest_Input: twitter__GetTweetRequest_Input;
  twitter__IngestTweetResponse: twitter__IngestTweetResponse;
  twitter__IngestTweetRequest_Input: twitter__IngestTweetRequest_Input;
  common__Timestamp_Input: common__Timestamp_Input;
  twitter__QueryTweetsResponse: twitter__QueryTweetsResponse;
  common__PaginationResponse: common__PaginationResponse;
  twitter__QueryTweetsRequest_Input: twitter__QueryTweetsRequest_Input;
  common__Pagination_Input: common__Pagination_Input;
  notification__GetNotificationsResponse: notification__GetNotificationsResponse;
  notification__Notification: notification__Notification;
  notification__GetNotificationsRequest_Input: notification__GetNotificationsRequest_Input;
  notification__SendNotificationResponse: notification__SendNotificationResponse;
  notification__SendNotificationRequest_Input: notification__SendNotificationRequest_Input;
  common__Empty: Scalars['common__Empty']['output'];
  notification__MarkReadRequest_Input: notification__MarkReadRequest_Input;
  nlp__AnalyzeTextResponse: nlp__AnalyzeTextResponse;
  nlp__AnalyzeTextRequest_Input: nlp__AnalyzeTextRequest_Input;
  nlp__GeocodeResponse: nlp__GeocodeResponse;
  nlp__GeocodeRequest_Input: nlp__GeocodeRequest_Input;
}>;

export type grpcMethodDirectiveArgs = {
  subgraph?: Maybe<Scalars['String']['input']>;
  rootJsonName?: Maybe<Scalars['String']['input']>;
  objPath?: Maybe<Scalars['String']['input']>;
  methodName?: Maybe<Scalars['String']['input']>;
  responseStream?: Maybe<Scalars['Boolean']['input']>;
};

export type grpcMethodDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = grpcMethodDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type grpcConnectivityStateDirectiveArgs = {
  subgraph?: Maybe<Scalars['String']['input']>;
  rootJsonName?: Maybe<Scalars['String']['input']>;
  objPath?: Maybe<Scalars['String']['input']>;
};

export type grpcConnectivityStateDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = grpcConnectivityStateDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type streamDirectiveArgs = {
  if?: Scalars['Boolean']['input'];
  label?: Maybe<Scalars['String']['input']>;
  initialCount?: Maybe<Scalars['Int']['input']>;
};

export type streamDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = streamDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type transportDirectiveArgs = {
  subgraph?: Maybe<Scalars['String']['input']>;
  kind?: Maybe<Scalars['String']['input']>;
  location?: Maybe<Scalars['String']['input']>;
  options?: Maybe<Scalars['TransportOptions']['input']>;
};

export type transportDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = transportDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  classification_ClassificationService_connectivityState?: Resolver<Maybe<ResolversTypes['ConnectivityState']>, ParentType, ContextType, Partial<Queryclassification_ClassificationService_connectivityStateArgs>>;
  user_UserService_GetUser?: Resolver<Maybe<ResolversTypes['user__User']>, ParentType, ContextType, Partial<Queryuser_UserService_GetUserArgs>>;
  user_UserService_connectivityState?: Resolver<Maybe<ResolversTypes['ConnectivityState']>, ParentType, ContextType, Partial<Queryuser_UserService_connectivityStateArgs>>;
  user_AuthService_connectivityState?: Resolver<Maybe<ResolversTypes['ConnectivityState']>, ParentType, ContextType, Partial<Queryuser_AuthService_connectivityStateArgs>>;
  twitter_TwitterService_GetTweet?: Resolver<Maybe<ResolversTypes['twitter__Tweet']>, ParentType, ContextType, Partial<Querytwitter_TwitterService_GetTweetArgs>>;
  twitter_TwitterService_connectivityState?: Resolver<Maybe<ResolversTypes['ConnectivityState']>, ParentType, ContextType, Partial<Querytwitter_TwitterService_connectivityStateArgs>>;
  notification_NotificationService_GetNotifications?: Resolver<Maybe<ResolversTypes['notification__GetNotificationsResponse']>, ParentType, ContextType, Partial<Querynotification_NotificationService_GetNotificationsArgs>>;
  notification_NotificationService_connectivityState?: Resolver<Maybe<ResolversTypes['ConnectivityState']>, ParentType, ContextType, Partial<Querynotification_NotificationService_connectivityStateArgs>>;
  nlp_NLPService_connectivityState?: Resolver<Maybe<ResolversTypes['ConnectivityState']>, ParentType, ContextType, Partial<Querynlp_NLPService_connectivityStateArgs>>;
}>;

export type MutationResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  classification_ClassificationService_ClassifyImage?: Resolver<Maybe<ResolversTypes['classification__ClassifyImageResponse']>, ParentType, ContextType, Partial<Mutationclassification_ClassificationService_ClassifyImageArgs>>;
  user_UserService_Register?: Resolver<Maybe<ResolversTypes['user__RegisterResponse']>, ParentType, ContextType, Partial<Mutationuser_UserService_RegisterArgs>>;
  user_UserService_Login?: Resolver<Maybe<ResolversTypes['user__LoginResponse']>, ParentType, ContextType, Partial<Mutationuser_UserService_LoginArgs>>;
  user_UserService_UpdateUser?: Resolver<Maybe<ResolversTypes['user__User']>, ParentType, ContextType, Partial<Mutationuser_UserService_UpdateUserArgs>>;
  user_AuthService_ValidateToken?: Resolver<Maybe<ResolversTypes['user__ValidateTokenResponse']>, ParentType, ContextType, Partial<Mutationuser_AuthService_ValidateTokenArgs>>;
  user_AuthService_RefreshToken?: Resolver<Maybe<ResolversTypes['user__RefreshTokenResponse']>, ParentType, ContextType, Partial<Mutationuser_AuthService_RefreshTokenArgs>>;
  twitter_TwitterService_IngestTweet?: Resolver<Maybe<ResolversTypes['twitter__IngestTweetResponse']>, ParentType, ContextType, Partial<Mutationtwitter_TwitterService_IngestTweetArgs>>;
  twitter_TwitterService_QueryTweets?: Resolver<Maybe<ResolversTypes['twitter__QueryTweetsResponse']>, ParentType, ContextType, Partial<Mutationtwitter_TwitterService_QueryTweetsArgs>>;
  notification_NotificationService_SendNotification?: Resolver<Maybe<ResolversTypes['notification__SendNotificationResponse']>, ParentType, ContextType, Partial<Mutationnotification_NotificationService_SendNotificationArgs>>;
  notification_NotificationService_MarkRead?: Resolver<Maybe<ResolversTypes['common__Empty']>, ParentType, ContextType, Partial<Mutationnotification_NotificationService_MarkReadArgs>>;
  nlp_NLPService_AnalyzeText?: Resolver<Maybe<ResolversTypes['nlp__AnalyzeTextResponse']>, ParentType, ContextType, Partial<Mutationnlp_NLPService_AnalyzeTextArgs>>;
  nlp_NLPService_Geocode?: Resolver<Maybe<ResolversTypes['nlp__GeocodeResponse']>, ParentType, ContextType, Partial<Mutationnlp_NLPService_GeocodeArgs>>;
}>;

export type classification__ClassifyImageResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['classification__ClassifyImageResponse'] = ResolversParentTypes['classification__ClassifyImageResponse']> = ResolversObject<{
  result?: Resolver<Maybe<ResolversTypes['classification__ClassificationResult']>, ParentType, ContextType>;
}>;

export type classification__ClassificationResultResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['classification__ClassificationResult'] = ResolversParentTypes['classification__ClassificationResult']> = ResolversObject<{
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  confidence?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  candidates?: Resolver<Maybe<Array<Maybe<ResolversTypes['classification__LabelScore']>>>, ParentType, ContextType>;
}>;

export type classification__LabelScoreResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['classification__LabelScore'] = ResolversParentTypes['classification__LabelScore']> = ResolversObject<{
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  confidence?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export interface ByteScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Byte'], any> {
  name: 'Byte';
}

export interface TransportOptionsScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['TransportOptions'], any> {
  name: 'TransportOptions';
}

export type user__UserResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['user__User'] = ResolversParentTypes['user__User']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['common__Timestamp']>, ParentType, ContextType>;
  updated_at?: Resolver<Maybe<ResolversTypes['common__Timestamp']>, ParentType, ContextType>;
}>;

export type common__TimestampResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['common__Timestamp'] = ResolversParentTypes['common__Timestamp']> = ResolversObject<{
  seconds?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  nanos?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export type user__RegisterResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['user__RegisterResponse'] = ResolversParentTypes['user__RegisterResponse']> = ResolversObject<{
  user?: Resolver<Maybe<ResolversTypes['user__User']>, ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type user__LoginResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['user__LoginResponse'] = ResolversParentTypes['user__LoginResponse']> = ResolversObject<{
  user?: Resolver<Maybe<ResolversTypes['user__User']>, ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type user__ValidateTokenResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['user__ValidateTokenResponse'] = ResolversParentTypes['user__ValidateTokenResponse']> = ResolversObject<{
  user_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type user__RefreshTokenResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['user__RefreshTokenResponse'] = ResolversParentTypes['user__RefreshTokenResponse']> = ResolversObject<{
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type twitter__TweetResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['twitter__Tweet'] = ResolversParentTypes['twitter__Tweet']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tweet_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  author_username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  media_urls?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['common__Timestamp']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
}>;

export interface JSONScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type twitter__IngestTweetResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['twitter__IngestTweetResponse'] = ResolversParentTypes['twitter__IngestTweetResponse']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type twitter__QueryTweetsResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['twitter__QueryTweetsResponse'] = ResolversParentTypes['twitter__QueryTweetsResponse']> = ResolversObject<{
  tweets?: Resolver<Maybe<Array<Maybe<ResolversTypes['twitter__Tweet']>>>, ParentType, ContextType>;
  pagination?: Resolver<Maybe<ResolversTypes['common__PaginationResponse']>, ParentType, ContextType>;
}>;

export type common__PaginationResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['common__PaginationResponse'] = ResolversParentTypes['common__PaginationResponse']> = ResolversObject<{
  page?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  per_page?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type notification__GetNotificationsResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['notification__GetNotificationsResponse'] = ResolversParentTypes['notification__GetNotificationsResponse']> = ResolversObject<{
  notifications?: Resolver<Maybe<Array<Maybe<ResolversTypes['notification__Notification']>>>, ParentType, ContextType>;
  pagination?: Resolver<Maybe<ResolversTypes['common__PaginationResponse']>, ParentType, ContextType>;
}>;

export type notification__NotificationResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['notification__Notification'] = ResolversParentTypes['notification__Notification']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  channel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['common__Timestamp']>, ParentType, ContextType>;
  read_at?: Resolver<Maybe<ResolversTypes['common__Timestamp']>, ParentType, ContextType>;
}>;

export type notification__SendNotificationResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['notification__SendNotificationResponse'] = ResolversParentTypes['notification__SendNotificationResponse']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface common__EmptyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['common__Empty'], any> {
  name: 'common__Empty';
}

export type nlp__AnalyzeTextResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['nlp__AnalyzeTextResponse'] = ResolversParentTypes['nlp__AnalyzeTextResponse']> = ResolversObject<{
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  confidence?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  extracted_address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paraphrased_text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type nlp__GeocodeResponseResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['nlp__GeocodeResponse'] = ResolversParentTypes['nlp__GeocodeResponse']> = ResolversObject<{
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lon?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  display_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext> = ResolversObject<{
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  classification__ClassifyImageResponse?: classification__ClassifyImageResponseResolvers<ContextType>;
  classification__ClassificationResult?: classification__ClassificationResultResolvers<ContextType>;
  classification__LabelScore?: classification__LabelScoreResolvers<ContextType>;
  Byte?: GraphQLScalarType;
  TransportOptions?: GraphQLScalarType;
  user__User?: user__UserResolvers<ContextType>;
  common__Timestamp?: common__TimestampResolvers<ContextType>;
  BigInt?: GraphQLScalarType;
  user__RegisterResponse?: user__RegisterResponseResolvers<ContextType>;
  user__LoginResponse?: user__LoginResponseResolvers<ContextType>;
  user__ValidateTokenResponse?: user__ValidateTokenResponseResolvers<ContextType>;
  user__RefreshTokenResponse?: user__RefreshTokenResponseResolvers<ContextType>;
  twitter__Tweet?: twitter__TweetResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  twitter__IngestTweetResponse?: twitter__IngestTweetResponseResolvers<ContextType>;
  twitter__QueryTweetsResponse?: twitter__QueryTweetsResponseResolvers<ContextType>;
  common__PaginationResponse?: common__PaginationResponseResolvers<ContextType>;
  notification__GetNotificationsResponse?: notification__GetNotificationsResponseResolvers<ContextType>;
  notification__Notification?: notification__NotificationResolvers<ContextType>;
  notification__SendNotificationResponse?: notification__SendNotificationResponseResolvers<ContextType>;
  common__Empty?: GraphQLScalarType;
  nlp__AnalyzeTextResponse?: nlp__AnalyzeTextResponseResolvers<ContextType>;
  nlp__GeocodeResponse?: nlp__GeocodeResponseResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  grpcMethod?: grpcMethodDirectiveResolver<any, any, ContextType>;
  grpcConnectivityState?: grpcConnectivityStateDirectiveResolver<any, any, ContextType>;
  stream?: streamDirectiveResolver<any, any, ContextType>;
  transport?: transportDirectiveResolver<any, any, ContextType>;
}>;

export type MeshInContextSDK = ClassificationTypes.Context & UserTypes.Context & TwitterTypes.Context & NotificationTypes.Context & NlpTypes.Context;

export type MeshContext = BaseMeshContext & MeshInContextSDK;


const baseDir = pathModule.join(typeof __dirname === 'string' ? __dirname : '/', '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".mesh/sources/User/schemaWithAnnotations":
      return import("./sources/User/schemaWithAnnotations") as T;
    
    case ".mesh/sources/Classification/schemaWithAnnotations":
      return import("./sources/Classification/schemaWithAnnotations") as T;
    
    case ".mesh/sources/Notification/schemaWithAnnotations":
      return import("./sources/Notification/schemaWithAnnotations") as T;
    
    case ".mesh/sources/NLP/schemaWithAnnotations":
      return import("./sources/NLP/schemaWithAnnotations") as T;
    
    case ".mesh/sources/Twitter/schemaWithAnnotations":
      return import("./sources/Twitter/schemaWithAnnotations") as T;
    
    default:
      return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
  }
};

const rootStore = new MeshStore('.mesh', new FsStoreStorageAdapter({
  cwd: baseDir,
  importFn,
  fileType: "ts",
}), {
  readonly: true,
  validate: false
});

export const rawServeConfig: YamlConfig.Config['serve'] = {"port":4000,"hostname":"0.0.0.0","browser":false,"healthCheckEndpoint":"/health"} as any
export async function getMeshOptions(): Promise<GetMeshOptions> {
const pubsub = new PubSub();
const sourcesStore = rootStore.child('sources');
const logger = new DefaultLogger("");
const MeshCache = await import("@graphql-mesh/cache-localforage").then(handleImport);
  const cache = new MeshCache({
      ...{},
      importFn,
      store: rootStore.child('cache'),
      pubsub,
      logger,
    })
const fetchFn = await import('@whatwg-node/fetch').then(m => m?.fetch || m);
const sources: MeshResolvedSource[] = [];
const transforms: MeshTransform[] = [];
const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
const classificationTransforms = [];
const userTransforms = [];
const twitterTransforms = [];
const notificationTransforms = [];
const nlpTransforms = [];
const additionalTypeDefs = [] as any[];
const ClassificationHandler = await import("@graphql-mesh/grpc").then(handleImport);
const classificationHandler = new ClassificationHandler({
              name: "Classification",
              config: {"endpoint":"classification-service:50053","source":{"file":"proto/classification/service.proto","load":{"includeDirs":["proto"]}}},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("Classification"),
              logger: logger.child({ source: "Classification" }),
              importFn,
            });
const UserHandler = await import("@graphql-mesh/grpc").then(handleImport);
const userHandler = new UserHandler({
              name: "User",
              config: {"endpoint":"user-auth-service:50051","source":{"file":"proto/user/service.proto","load":{"includeDirs":["proto"]}}},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("User"),
              logger: logger.child({ source: "User" }),
              importFn,
            });
const TwitterHandler = await import("@graphql-mesh/grpc").then(handleImport);
const twitterHandler = new TwitterHandler({
              name: "Twitter",
              config: {"endpoint":"twitter-service:50052","source":{"file":"proto/twitter/service.proto","load":{"includeDirs":["proto"]}}},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("Twitter"),
              logger: logger.child({ source: "Twitter" }),
              importFn,
            });
const NotificationHandler = await import("@graphql-mesh/grpc").then(handleImport);
const notificationHandler = new NotificationHandler({
              name: "Notification",
              config: {"endpoint":"notification-service:50054","source":{"file":"proto/notification/service.proto","load":{"includeDirs":["proto"]}}},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("Notification"),
              logger: logger.child({ source: "Notification" }),
              importFn,
            });
const NlpHandler = await import("@graphql-mesh/grpc").then(handleImport);
const nlpHandler = new NlpHandler({
              name: "NLP",
              config: {"endpoint":"nlp-service:50055","source":{"file":"proto/nlp/service.proto","load":{"includeDirs":["proto"]}}},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("NLP"),
              logger: logger.child({ source: "NLP" }),
              importFn,
            });
sources[0] = {
          name: 'Classification',
          handler: classificationHandler,
          transforms: classificationTransforms
        }
sources[1] = {
          name: 'User',
          handler: userHandler,
          transforms: userTransforms
        }
sources[2] = {
          name: 'Twitter',
          handler: twitterHandler,
          transforms: twitterTransforms
        }
sources[3] = {
          name: 'Notification',
          handler: notificationHandler,
          transforms: notificationTransforms
        }
sources[4] = {
          name: 'NLP',
          handler: nlpHandler,
          transforms: nlpTransforms
        }
const additionalResolvers = [] as any[]
const Merger = await import("@graphql-mesh/merger-stitching").then(handleImport);
const merger = new Merger({
        cache,
        pubsub,
        logger: logger.child({ merger: "stitching" }),
        store: rootStore.child("stitching")
      })

  return {
    sources,
    transforms,
    additionalTypeDefs,
    additionalResolvers,
    cache,
    pubsub,
    merger,
    logger,
    additionalEnvelopPlugins,
    get documents() {
      return [
      
    ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltMesh,
    rawServeConfig: {"port":4000,"hostname":"0.0.0.0","browser":false,"healthCheckEndpoint":"/health"},
  })
}


let meshInstance$: Promise<MeshInstance> | undefined;

export const pollingInterval = null;

export function getBuiltMesh(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    if (pollingInterval) {
      setInterval(() => {
        getMeshOptions()
        .then(meshOptions => getMesh(meshOptions))
        .then(newMesh =>
          meshInstance$.then(oldMesh => {
            oldMesh.destroy()
            meshInstance$ = Promise.resolve(newMesh)
          })
        ).catch(err => {
          console.error("Mesh polling failed so the existing version will be used:", err);
        });
      }, pollingInterval)
    }
    meshInstance$ = getMeshOptions().then(meshOptions => getMesh(meshOptions)).then(mesh => {
      const id = mesh.pubsub.subscribe('destroy', () => {
        meshInstance$ = undefined;
        mesh.pubsub.unsubscribe(id);
      });
      return mesh;
    }).catch((err) => {
      meshInstance$ = undefined;
      return Promise.reject(err);
    });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) => getBuiltMesh().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) => getBuiltMesh().then(({ subscribe }) => subscribe(...args));