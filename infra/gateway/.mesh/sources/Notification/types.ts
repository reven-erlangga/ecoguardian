// @ts-nocheck

import type { InContextSdkMethod } from '@graphql-mesh/types';

export namespace NotificationTypes {
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
  common__Empty: { input: any; output: any; }
  TransportOptions: { input: unknown; output: unknown; }
};

export type Query = {
  notification_NotificationService_GetNotifications?: Maybe<notification__GetNotificationsResponse>;
  notification_NotificationService_connectivityState?: Maybe<ConnectivityState>;
};


export type Querynotification_NotificationService_GetNotificationsArgs = {
  input?: InputMaybe<notification__GetNotificationsRequest_Input>;
};


export type Querynotification_NotificationService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
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

export type common__Timestamp = {
  seconds?: Maybe<Scalars['BigInt']['output']>;
  nanos?: Maybe<Scalars['Int']['output']>;
};

export type common__PaginationResponse = {
  page?: Maybe<Scalars['Int']['output']>;
  per_page?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type notification__GetNotificationsRequest_Input = {
  user_id?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<common__Pagination_Input>;
};

export type common__Pagination_Input = {
  page?: InputMaybe<Scalars['Int']['input']>;
  per_page?: InputMaybe<Scalars['Int']['input']>;
};

export type ConnectivityState =
  | 'IDLE'
  | 'CONNECTING'
  | 'READY'
  | 'TRANSIENT_FAILURE'
  | 'SHUTDOWN';

export type Mutation = {
  notification_NotificationService_SendNotification?: Maybe<notification__SendNotificationResponse>;
  notification_NotificationService_MarkRead?: Maybe<Scalars['common__Empty']['output']>;
};


export type Mutationnotification_NotificationService_SendNotificationArgs = {
  input?: InputMaybe<notification__SendNotificationRequest_Input>;
};


export type Mutationnotification_NotificationService_MarkReadArgs = {
  input?: InputMaybe<notification__MarkReadRequest_Input>;
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

  export type QuerySdk = {
      
  notification_NotificationService_GetNotifications: InContextSdkMethod<Query['notification_NotificationService_GetNotifications'], Querynotification_NotificationService_GetNotificationsArgs, BaseMeshContext>,
  
  notification_NotificationService_connectivityState: InContextSdkMethod<Query['notification_NotificationService_connectivityState'], Querynotification_NotificationService_connectivityStateArgs, BaseMeshContext>
  };

  export type MutationSdk = {
      
  notification_NotificationService_SendNotification: InContextSdkMethod<Mutation['notification_NotificationService_SendNotification'], Mutationnotification_NotificationService_SendNotificationArgs, BaseMeshContext>,
  
  notification_NotificationService_MarkRead: InContextSdkMethod<Mutation['notification_NotificationService_MarkRead'], Mutationnotification_NotificationService_MarkReadArgs, BaseMeshContext>
  };

  export type SubscriptionSdk = {
    
  };

  export type Context = {
      ["Notification"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
