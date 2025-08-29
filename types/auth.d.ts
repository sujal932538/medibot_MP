import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      role: "admin" | "doctor" | "patient"
    } & DefaultSession["user"]
  }

  interface User {
    role: "admin" | "doctor" | "patient"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "doctor" | "patient"
  }
}