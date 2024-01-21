import { z } from "zod";

const Config = z.object({
  port: z.preprocess((port) => parseInt(String(port), 10), z.number()),
  webAppUrl: z.string().url(),
});

export const config = Config.parse({
  port: process.env.PORT,
  webAppUrl: process.env.WEB_APP_URL,
});
