import jwt from "jsonwebtoken";

import User from "../modules/auth/auth.model.js";

import AppError from "../shared/errors/AppError.js";

const protect = async (
  req,
  res,
  next
) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        "Bearer"
      )
    ) {
      token =
        req.headers.authorization.split(
          " "
        )[1];
    }

    if (!token) {
      return next(
        new AppError(
          "Not authorized",
          401
        )
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    const user =
      await User.findById(
        decoded.id
      ).select("-passwordHash");

    if (!user) {
      return next(
        new AppError(
          "User not found",
          401
        )
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(
      new AppError(
        "Invalid token",
        401
      )
    );
  }
};

export default protect;