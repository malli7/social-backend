import jwt from "jsonwebtoken";
const JWTSEC = process.env.JWTSEC || "test";

const Auth = (req, res, next) => {
  const token = req.headers.token;

  if (token) {
    let decodedData = jwt.verify(token, JWTSEC);
    req.userId = decodedData?.id;
  }
  next();
};

export default Auth;