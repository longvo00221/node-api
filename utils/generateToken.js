import  jwt  from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
export const generateRefreshToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};


export default generateToken;
