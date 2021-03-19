import * as jwt from 'jsonwebtoken';

export const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    if (token && token.length > 7) {
      const decode = jwt.decode(token.substring(7));
      if (decode) {
        req.user = decode;
      }
    }
  }

  next();
};
