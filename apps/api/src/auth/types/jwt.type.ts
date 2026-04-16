export type JwtQureyPayload = {
  sub: string;
  email: string;
};

export type JwtPayload = {
  sub: string;
  fullname: string;
  username: string;
  email: string;
};

export type JWTCookiePayload = {
  sub: string;
  device: string;
};
