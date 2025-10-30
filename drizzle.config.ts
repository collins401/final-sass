import "dotenv/config";

import { type Config, defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: './drizzle',
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
}) satisfies Config;