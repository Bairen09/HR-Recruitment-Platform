import { body } from "express-validator";

export const createUserValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage(
      "Password must be at least 8 characters"
    ),

  body("role")
    .notEmpty()
    .withMessage("Role required"),
];