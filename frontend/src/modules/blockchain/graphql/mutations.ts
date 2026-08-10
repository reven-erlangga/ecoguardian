export const RECORD_CLASSIFICATION = `mutation($input: blockchain__RecordClassificationRequest_Input) {
  blockchain_BlockchainService_RecordClassification(input: $input) {
    index hash
  }
}`;

export const VERIFY_CHAIN = `mutation {
  blockchain_BlockchainService_VerifyChain {
    valid blocks_count error
  }
}`;
