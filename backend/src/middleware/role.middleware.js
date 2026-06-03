import AppError from "../shared/errors/AppError.js";

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (
      !roles.includes(
        req.user.role
      )
    ) {
      return next(
        new AppError(
          "Access denied",
          403
        )
      );
    }

    next();
  };

export default authorize;