import { z } from 'zod';

const envSchema = z.object({
    API_URL: z.string().url().transform((url) => url.endsWith('/') ? url.slice(0, -1) : url),
    INTERNAL_API_URL: z.string().url().transform((url) => url.endsWith('/') ? url.slice(0, -1) : url),
    CARD_PEM: z.string()
});

type Config = z.infer<typeof envSchema>;
const config: Config = envSchema.parse({
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    INTERNAL_API_URL: process.env.EXPO_PUBLIC_INTERNAL_API_URL,
    CARD_PEM: process.env.EXPO_PUBLIC_CARD_PEM
});

export default config;