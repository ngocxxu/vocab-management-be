import jwt from 'jsonwebtoken';

export const verifyToken = (token: string) => {
  return new Promise((resolve, reject) => {
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN_SECRET;

    if (!token) {
      return reject(new Error('No token provided'));
    }

    if (!ACCESS_TOKEN) {
      console.error('ACCESS_TOKEN_SECRET is not set');
      return reject(new Error('Server configuration error'));
    }

    jwt.verify(token, ACCESS_TOKEN, (err: any, user: any) => {
      if (err) {
        console.error('Error verifying token:', err);
        if (err.name === 'TokenExpiredError') {
          return reject(new Error('Token expired'));
        } else if (err.name === 'JsonWebTokenError') {
          return reject(new Error('Invalid token'));
        } else if (err.name === 'NotBeforeError') {
          return reject(new Error('Token not yet active'));
        }
        return reject(new Error('Token verification failed'));
      }
      resolve(user);
    });
  });
};
