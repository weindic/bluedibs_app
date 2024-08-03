import { z } from "zod";

export const updateProfileSchema = z.object({
  bio: z.string().optional(),

  avatar: z.any().optional(),
  mobile: z.coerce
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number is required",
    }),
   

  gender: z.enum(["MALE", "FEMALE" , "OTHER"], {
    required_error: "Gender is required",
    invalid_type_error: "Gender is required",
  }),
  dob: z.date({ required_error: "DOB is required" }),
  id:  z.string().optional(),
  refralCode: z.string().optional(),
});
