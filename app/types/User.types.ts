export type TUserInfoToken = { _id: string; username: string }

export type TRegisterUserReq = {
  username: string
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
  refreshToken: string
}