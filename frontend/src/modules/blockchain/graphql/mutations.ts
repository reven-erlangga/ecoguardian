export const RECORD_CLASSIFICATION = `mutation($input: blockchain_RecordClassificationRequest_Input) {
  blockchain_BlockchainService_RecordClassification(input: $input) {
    index hash
  }
}`;
