import { z } from "zod";

const Config = z.object({
  apiUrl: z.string().url(),
});

export const config = Config.parse({
  apiUrl: import.meta.env.VITE_API_URL,
});
