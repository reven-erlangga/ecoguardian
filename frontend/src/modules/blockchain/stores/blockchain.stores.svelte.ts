import { client } from '@shared/utils/graphql';
import { camelizeKeys } from '@shared/utils/camelize';
import { fetchBlockchainHistory, verifyChain } from '../services/blockchain.service';
import { RECORD_CLASSIFICATION } from '../graphql/mutations';
import type { Block, VerifyResponse } from '../types';
import type { StateData } from '@shared/types/state.types';

const state = $state<StateData<{
  blocks: Block[];
  verifyResult: VerifyResponse | null;
}>>({
  meta: { loading: false, message: '' },
  data: { blocks: [], verifyResult: null },
});

export const blockchainStore = {
  state,

  actions: {
    async fetchHistory() {
      state.meta = { loading: true, message: '' };
      try {
        const raw = await fetchBlockchainHistory();
        state.data.blocks = camelizeKeys(raw);
        state.meta = { loading: false, message: '' };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal memuat history blockchain.';
        state.meta = { loading: false, message: msg };
        throw e;
      }
    },

    async verify() {
      state.meta = { loading: true, message: '' };
      try {
        const raw = await verifyChain();
        state.data.verifyResult = camelizeKeys(raw);
        state.meta = { loading: false, message: '' };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gagal verifikasi chain.';
        state.meta = { loading: false, message: msg };
        throw e;
      }
    },

    async recordClassification(data: { tweetId: string; label: string; confidence: number; imageHash: string }) {
      const r = await client.mutation(RECORD_CLASSIFICATION, { input: data }).toPromise();
      if (r.error) throw new Error(r.error.message);
      return r.data?.blockchain_BlockchainService_RecordClassification;
    },
  },
};