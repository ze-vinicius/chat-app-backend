import jwt from "jsonwebtoken";
import User from "../models/user";

export const validateToken = async (token) => {
  try {
    const decoded = jwt.verify(token, "mysecret");
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error("Token inválido");
    }

    return user;
  } catch (error) {
    throw error;
  }
};
