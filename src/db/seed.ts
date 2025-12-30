import { db } from "./index";
import * as schema from "./schema";

async function main() {
  console.log("🌱 Seeding database...");

  const options = [
    {
      key: "site_title",
      value: "TanStack Sass Starter",
      group: "general",
      type: "string",
      isPublic: true,
      description: "The name of your website",
    },
    {
      key: "site_description",
      value: "A modern full-stack starter template built with TanStack Start",
      group: "general",
      type: "string",
      isPublic: true,
      description: "The description of your website used for SEO",
    },
    {
      key: "site_url",
      value: "http://localhost:3000",
      group: "general",
      type: "string",
      isPublic: true,
      description: "The public URL of your website",
    },
    {
      key: "ai_config",
      value: JSON.stringify({
        activeProvider: "openai",
        providers: [
          {
            name: "openai",
            baseUrl: "https://api.openai.com/v1",
            apiKey: "",
            model: "gpt-4o",
          },
          {
            name: "anthropic",
            baseUrl: "https://api.anthropic.com/v1",
            apiKey: "",
            model: "claude-3-5-sonnet-20240620",
          },
        ],
      }),
      group: "ai",
      type: "json",
      isPublic: false,
      description: "Configuration for AI providers",
    },
    {
      key: "seo_keywords",
      value: "react, tanstack, start, sass, drizzle, sqlite",
      group: "seo",
      type: "string",
      isPublic: true,
      description: "Comma-separated keywords for SEO",
    },
  ] as const;

  for (const opt of options) {
    await db
      .insert(schema.option)
      .values(opt)
      .onConflictDoUpdate({
        target: schema.option.key,
        set: {
          value: opt.value,
          group: opt.group,
          type: opt.type,
          isPublic: opt.isPublic,
          description: opt.description,
          updatedAt: new Date(),
        },
      });
  }

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
