
import { db } from "./src/lib/db";
import { post, user } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding posts...");

  // Get a user to be the author
  const users = await db.select().from(user).limit(1);
  let authorId = users[0]?.id;

  if (!authorId) {
    console.log("No users found. Creating a dummy user...");
    const [newUser] = await db.insert(user).values({
      id: "dummy-user-" + Date.now(),
      name: "Demo User",
      email: "demo@example.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    authorId = newUser.id;
  }

  await db.insert(post).values([
    {
      title: "Getting Started with TanStack Start",
      slug: "getting-started-tanstack-start",
      content: "This is a great framework...",
      excerpt: "Learn the basics.",
      status: "published",
      authorId,
      publishedAt: new Date(),
    },
    {
      title: "Draft Post",
      slug: "draft-post",
      content: "Still working on this...",
      excerpt: "Draft content.",
      status: "draft",
      authorId,
    },
    {
      title: "Advanced Patterns",
      slug: "advanced-patterns",
      content: "Deep dive...",
      excerpt: "For experts.",
      status: "archived",
      authorId,
    },
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
