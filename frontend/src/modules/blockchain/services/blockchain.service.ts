import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import { GET_HISTORY, VERIFY_CHAIN } from '../graphql/queries';

export async function fetchBlockchainHistory(): Promise<any[]> {
  const r = await client.query(GET_HISTORY, { input: {} }).toPromise();
  return r.data?.blockchain_BlockchainService_GetHistory?.blocks ?? [];
}

export async function verifyChain(): Promise<any> {
  const r = await client.query(VERIFY_CHAIN, {}).toPromise();
  return r.data?.blockchain_BlockchainService_VerifyChain ?? null;
}