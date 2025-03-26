import mongoose from "mongoose";
import { z } from "zod";

const registerUserSchema = z.object({
    name: z
        .string({ required_error: "name es required" })
        .min(3, { message: "name must be at least 3 characters" }),
    email: z
        .string({ required_error: "email is required" })
        .email({ message: "Invalid email" }),
    password: z
        .string({ required_error: "password is required" })
        .min(4, { message: "password must be at least 4 characters" })
});

const loginSchema = z.object({
    email: z
        .string({ required_error: "email is reqired" })
        .email({ message: "invalid Email" }),
    password: z
        .string({ required_error: "password is required" })
        .min(4, { message: "password must be at least 4 characters" }),
});

export { registerUserSchema, loginSchema };
