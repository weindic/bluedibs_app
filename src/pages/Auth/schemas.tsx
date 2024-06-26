import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPassFormSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
});

export const signupSchema = loginSchema
  .extend({
    username: z.string().regex(/^[a-z0-9]{3,32}$/, {
      message:
        "Capital letters are not allowed, Username cannot contain special characters & must be 3-32 characters long.",
    }),
    firebaseId: z.string(),
    email: z.string().email(),
  })
  .omit({
    password: true,
  });
