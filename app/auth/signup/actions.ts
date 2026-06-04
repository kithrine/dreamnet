"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function signUpAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const username = (formData.get("username") as string).trim();
  const password = formData.get("password") as string;
  const avatarId = parseInt(formData.get("avatarId") as string) || 1;

  if (!email || !username || !password) return { error: "All fields are required." };
  if (username.length < 3) return { error: "Username must be at least 3 characters." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) return { error: "Email or username is already taken." };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, username, passwordHash, avatarId } });

  redirect("/auth/signin?registered=1");
}
