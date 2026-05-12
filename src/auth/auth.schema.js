import { z } from "zod";

const passwordValidation = z
  .string()
  .min(8, "La contraseña debe tener una longitud mínima de 8 caracteres")
  .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
  .regex(/[0-9]/, "Debe tener al menos un número")
  .regex(/[^a-zA-Z0-9]/, "Debe tener al menos un carácter especial");

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  password: passwordValidation,
  role: z.enum(["USER", "MANAGER", "ADMIN"]).default("USER"),
});

export const loginSchema = z.object({
  email: z.string().email("Debe ser un email válido"),
  password: passwordValidation,
});
