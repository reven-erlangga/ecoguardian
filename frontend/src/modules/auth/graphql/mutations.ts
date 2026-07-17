export const LOGIN_MUTATION = `mutation($input: user__LoginRequest_Input) {
  user_UserService_Login(input: $input) { user { id email username role } token }
}`;

export const REGISTER_MUTATION = `mutation($input: user__RegisterRequest_Input) {
  user_UserService_Register(input: $input) { user { id email username role } token }
}`;
