export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
  };
}
export interface IRefreshTokenResponse {
  accessToken: string;
}
