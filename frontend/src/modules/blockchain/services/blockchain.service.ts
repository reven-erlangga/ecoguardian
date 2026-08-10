import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import { GET_HISTORY } from '../graphql/queries';
import { VERIFY_CHAIN } from '../graphql/mutations';

export async function fetchBlockchainHistory(): Promise<any[]> {
  const r = await client.query(GET_HISTORY, { input: {} }).toPromise();
  return camelizeKeys(r.data?.blockchain_BlockchainService_GetHistory?.blocks ?? []);
}

export async function verifyChain(): Promise<any> {
  const r = await client.mutation(VERIFY_CHAIN, {}).toPromise();
  return camelizeKeys(r.data?.blockchain_BlockchainService_VerifyChain ?? null);
}
