export const VALIDATE_TOKEN_MUTATION = `mutation($input: user__ValidateTokenRequest_Input) {
  user_AuthService_ValidateToken(input: $input) { userId role }
}`;

export const USER_COUNT = `query {
  user_UserService_GetUserCount {
    count
  }
}`;
