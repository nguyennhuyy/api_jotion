export interface UserJwtInfo {
  user: {
    email: string;
    id: string;
    iat: number;
    exp: number;
  };
}
