// @ts-nocheck

import type { InContextSdkMethod } from '@graphql-mesh/types';

export namespace UserTypes {
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
  TransportOptions: { input: unknown; output: unknown; }
};

export type Query = {
  user_UserService_GetUser?: Maybe<user__User>;
  user_UserService_connectivityState?: Maybe<ConnectivityState>;
  user_AuthService_connectivityState?: Maybe<ConnectivityState>;
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

export type ConnectivityState =
  | 'IDLE'
  | 'CONNECTING'
  | 'READY'
  | 'TRANSIENT_FAILURE'
  | 'SHUTDOWN';

export type Mutation = {
  user_UserService_Register?: Maybe<user__RegisterResponse>;
  user_UserService_Login?: Maybe<user__LoginResponse>;
  user_UserService_UpdateUser?: Maybe<user__User>;
  user_AuthService_ValidateToken?: Maybe<user__ValidateTokenResponse>;
  user_AuthService_RefreshToken?: Maybe<user__RefreshTokenResponse>;
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

  export type QuerySdk = {
      
  user_UserService_GetUser: InContextSdkMethod<Query['user_UserService_GetUser'], Queryuser_UserService_GetUserArgs, BaseMeshContext>,
  
  user_UserService_connectivityState: InContextSdkMethod<Query['user_UserService_connectivityState'], Queryuser_UserService_connectivityStateArgs, BaseMeshContext>,
  
  user_AuthService_connectivityState: InContextSdkMethod<Query['user_AuthService_connectivityState'], Queryuser_AuthService_connectivityStateArgs, BaseMeshContext>
  };

  export type MutationSdk = {
      
  user_UserService_Register: InContextSdkMethod<Mutation['user_UserService_Register'], Mutationuser_UserService_RegisterArgs, BaseMeshContext>,
  
  user_UserService_Login: InContextSdkMethod<Mutation['user_UserService_Login'], Mutationuser_UserService_LoginArgs, BaseMeshContext>,
  
  user_UserService_UpdateUser: InContextSdkMethod<Mutation['user_UserService_UpdateUser'], Mutationuser_UserService_UpdateUserArgs, BaseMeshContext>,
  
  user_AuthService_ValidateToken: InContextSdkMethod<Mutation['user_AuthService_ValidateToken'], Mutationuser_AuthService_ValidateTokenArgs, BaseMeshContext>,
  
  user_AuthService_RefreshToken: InContextSdkMethod<Mutation['user_AuthService_RefreshToken'], Mutationuser_AuthService_RefreshTokenArgs, BaseMeshContext>
  };

  export type SubscriptionSdk = {
    
  };

  export type Context = {
      ["User"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
