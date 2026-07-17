export const GET_HISTORY = `query($input: blockchain_GetHistoryRequest_Input) {
  blockchain_BlockchainService_GetHistory(input: $input) {
    blocks { index timestamp previous_hash hash nonce data { type tweet_id label confidence image_hash location { lat lon address } resolution { admin_id notes resolved_image_hash resolved_at } } }
  }
}`;

export const VERIFY_CHAIN = `query {
  blockchain_BlockchainService_VerifyChain {
    valid blocks_count error
  }
}`;
