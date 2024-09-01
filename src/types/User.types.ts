export type TUserInfoToken = { _id: string; email: string }

export type TRegisterUserReq = {
  email: string
  password: string;
}

export type TRefreshToken = {
  refreshToken: string
}

export type TLogoutAllDeviceUserReq = {
  userId: string
}

export type TLoginUserRes = {
  accessToken: string
}