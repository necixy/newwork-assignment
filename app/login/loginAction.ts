import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loginAction(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    // Optionally, set a cookie or redirect to an error page
    redirect("/login?error=missing");
    return;
  }

  const user = await prisma.employee.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login?error=invalid");
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    redirect("/login?error=invalid");
    return;
  }

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("userId", String(user.id), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  redirect("/dashboard");
}
