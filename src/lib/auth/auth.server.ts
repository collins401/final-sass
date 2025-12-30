import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI, organization } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema"; // your drizzle instance
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "mysql", "sqlite"
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  advanced: {
    cookiePrefix: "__tanstack_sass_auth",
  },
  plugins: [
    organization({
      async sendInvitationEmail(data: any) {
        // await sendInvitationEmail({
        // 	data: {
        // 		username: data.email,
        // 		id: data.id,
        // 		invitedByEmail: data.inviter.user.email,
        // 		invitedByUsername: data.inviter.user.name,
        // 		teamName: data.organization.name,
        // 	},
        // });
      },
    }),
    admin({
      adminUserIds: ["PIWaAlci7VBBRckZZZNNnBsusRcST43j"],
    }),
    openAPI(),
  ],
});
