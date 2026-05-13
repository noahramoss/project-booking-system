import z from "zod";

export const createHotelSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre del hotel debe tener al menos 2 caracteres")
    .max(200, "Máximo 200 caracteres"),
  description: z.string().optional(),
  city: z.string().max(100),
  country: z.string().max(100),
  stars: z.number().int().min(1).max(5).default(1),
});

// Convierte todos los campos de createHotelSchema en opcionales.
// Si el cliente envía un campo, Zod validará sus reglas (ej. max 200 caracteres).
// Si no lo envía, Zod simplemente lo ignora y lo deja pasar.
export const updateHotelSchema = createHotelSchema.partial();
