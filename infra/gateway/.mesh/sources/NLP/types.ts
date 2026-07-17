// @ts-nocheck

import type { InContextSdkMethod } from '@graphql-mesh/types';

export namespace NlpTypes {
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
  TransportOptions: { input: unknown; output: unknown; }
};

export type Query = {
  nlp_NLPService_connectivityState?: Maybe<ConnectivityState>;
};


export type Querynlp_NLPService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ConnectivityState =
  | 'IDLE'
  | 'CONNECTING'
  | 'READY'
  | 'TRANSIENT_FAILURE'
  | 'SHUTDOWN';

export type Mutation = {
  nlp_NLPService_AnalyzeText?: Maybe<nlp__AnalyzeTextResponse>;
  nlp_NLPService_Geocode?: Maybe<nlp__GeocodeResponse>;
};


export type Mutationnlp_NLPService_AnalyzeTextArgs = {
  input?: InputMaybe<nlp__AnalyzeTextRequest_Input>;
};


export type Mutationnlp_NLPService_GeocodeArgs = {
  input?: InputMaybe<nlp__GeocodeRequest_Input>;
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

  export type QuerySdk = {
      
  nlp_NLPService_connectivityState: InContextSdkMethod<Query['nlp_NLPService_connectivityState'], Querynlp_NLPService_connectivityStateArgs, BaseMeshContext>
  };

  export type MutationSdk = {
      
  nlp_NLPService_AnalyzeText: InContextSdkMethod<Mutation['nlp_NLPService_AnalyzeText'], Mutationnlp_NLPService_AnalyzeTextArgs, BaseMeshContext>,
  
  nlp_NLPService_Geocode: InContextSdkMethod<Mutation['nlp_NLPService_Geocode'], Mutationnlp_NLPService_GeocodeArgs, BaseMeshContext>
  };

  export type SubscriptionSdk = {
    
  };

  export type Context = {
      ["NLP"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
