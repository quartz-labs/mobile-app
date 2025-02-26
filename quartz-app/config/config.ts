import { z } from 'zod';
import Config from "react-native-config";

const envSchema = z.object({
    API_URL: z.string().url().transform((url) => url.endsWith('/') ? url.slice(0, -1) : url),
    INTERNAL_API_URL: z.string().url().transform((url) => url.endsWith('/') ? url.slice(0, -1) : url),
    CARD_PEM: z.string()
});

type Config = z.infer<typeof envSchema>;
const config: Config = envSchema.parse({
    API_URL: Config.API_URL,
    INTERNAL_API_URL: Config.INTERNAL_API_URL,
    CARD_PEM: Config.CARD_PEM
});

export default config;