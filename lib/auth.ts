import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (credentials.email !== adminEmail) return null;

                const isValid =
                    credentials.password === adminPassword ||
                    (adminPassword?.startsWith("$2") &&
                        (await bcrypt.compare(credentials.password, adminPassword)));

                if (!isValid) return null;

                return { id: "1", email: adminEmail, name: "Admin" };
            },
        }),
    ],
    session: { strategy: "jwt" as const },
    pages: { signIn: "/admin/login" },
    secret: process.env.NEXTAUTH_SECRET,
};
