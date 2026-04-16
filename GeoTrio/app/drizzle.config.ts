import path from "node:path";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: path.join(process.cwd(), ".data", "stride.sqlite"),
  },
});
