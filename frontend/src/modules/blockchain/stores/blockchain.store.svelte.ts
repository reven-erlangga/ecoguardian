import { client } from '@shared/utils/graphql';
import { GET_HISTORY, VERIFY_CHAIN } from '../graphql/queries';
import { RECORD_CLASSIFICATION } from '../graphql/mutations';
import type { Block, VerifyResponse } from '@shared/types/blockchain';

let _blocks = $state<Block[]>([]);
let _loading = $state(false);
let _verifyResult = $state<VerifyResponse | null>(null);

export const blockchainStore = {
  get blocks() { return _blocks; },
  get loading() { return _loading; },
  get verifyResult() { return _verifyResult; },
  async fetchHistory() {
    _loading = true;
    const r = await client.query(GET_HISTORY, { input: {} }).toPromise();
    if (!r.error && r.data?.blockchain_BlockchainService_GetHistory) {
      _blocks = r.data.blockchain_BlockchainService_GetHistory.blocks;
    }
    _loading = false;
  },
  async verify() {
    _loading = true;
    const r = await client.query(VERIFY_CHAIN, {}).toPromise();
    if (!r.error && r.data?.blockchain_BlockchainService_VerifyChain) {
      _verifyResult = r.data.blockchain_BlockchainService_VerifyChain;
    }
    _loading = false;
  },
  async recordClassification(data: { tweetId: string; label: string; confidence: number; imageHash: string }) {
    const r = await client.mutation(RECORD_CLASSIFICATION, { input: data }).toPromise();
    if (r.error) throw new Error(r.error.message);
    return r.data?.blockchain_BlockchainService_RecordClassification;
  },
};
