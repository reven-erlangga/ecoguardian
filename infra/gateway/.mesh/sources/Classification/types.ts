// @ts-nocheck

import type { InContextSdkMethod } from '@graphql-mesh/types';

export namespace ClassificationTypes {
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
};

export type Query = {
  classification_ClassificationService_connectivityState?: Maybe<ConnectivityState>;
};


export type Queryclassification_ClassificationService_connectivityStateArgs = {
  tryToConnect?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ConnectivityState =
  | 'IDLE'
  | 'CONNECTING'
  | 'READY'
  | 'TRANSIENT_FAILURE'
  | 'SHUTDOWN';

export type Mutation = {
  classification_ClassificationService_ClassifyImage?: Maybe<classification__ClassifyImageResponse>;
};


export type Mutationclassification_ClassificationService_ClassifyImageArgs = {
  input?: InputMaybe<classification__ClassifyImageRequest_Input>;
};

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

  export type QuerySdk = {
      
  classification_ClassificationService_connectivityState: InContextSdkMethod<Query['classification_ClassificationService_connectivityState'], Queryclassification_ClassificationService_connectivityStateArgs, BaseMeshContext>
  };

  export type MutationSdk = {
      
  classification_ClassificationService_ClassifyImage: InContextSdkMethod<Mutation['classification_ClassificationService_ClassifyImage'], Mutationclassification_ClassificationService_ClassifyImageArgs, BaseMeshContext>
  };

  export type SubscriptionSdk = {
    
  };

  export type Context = {
      ["Classification"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
