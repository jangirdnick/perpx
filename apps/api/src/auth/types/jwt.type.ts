export type JwtQureyPayload = {
  sub: string;
  email: string;
};

export type JwtPayload = {
  sub: string;
  fullname: string;
  email: string;
  emailVerified: boolean;
  role: string;
};

export type JWTCookiePayload = {
  sub: string;
  device: string;
};
