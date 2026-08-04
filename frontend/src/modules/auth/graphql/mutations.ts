export const LOGIN_MUTATION = `mutation($input: user__LoginRequest_Input) {
  user_UserService_Login(input: $input) { user { id email username role } token refresh_token }
}`;

export const REGISTER_MUTATION = `mutation($input: user__RegisterRequest_Input) {
  user_UserService_Register(input: $input) { user { id email username role } token refresh_token }
}`;

export const REFRESH_TOKEN_MUTATION = `mutation($input: user__RefreshTokenRequest_Input) {
  user_AuthService_RefreshToken(input: $input) { token refresh_token }
}`;

export const LOGOUT_MUTATION = `mutation($input: user__LogoutRequest_Input) {
  user_AuthService_Logout(input: $input) { success }
}`;

export const UPDATE_USER_MUTATION = `mutation($input: user__UpdateUserRequest_Input) {
  user_UserService_UpdateUser(input: $input) { id email username role }
}`;

export const VALIDATE_TOKEN_MUTATION = `mutation($input: user__ValidateTokenRequest_Input) {
  user_AuthService_ValidateToken(input: $input) { user_id role email username }
}`;
