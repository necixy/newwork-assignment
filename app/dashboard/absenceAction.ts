import { PrismaClient, Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function requestAbsenceAction(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const employeeId = cookieStore.get("userId")?.value;
  if (!employeeId) redirect("/login");

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  if (!startDate || !endDate) {
    redirect("/dashboard?error=missing_dates");
    return;
  }

  await prisma.absenceRequest.create({
    data: {
      employeeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  redirect("/dashboard");
}

export async function approveAbsenceAction(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const user = await prisma.employee.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== Role.MANAGER) {
    redirect("/dashboard");
    return;
  }

  const requestId = formData.get("requestId") as string;

  await prisma.absenceRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" },
  });

  redirect("/dashboard");
}

export async function rejectAbsenceAction(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const user = await prisma.employee.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== Role.MANAGER) {
    redirect("/dashboard");
    return;
  }

  const requestId = formData.get("requestId") as string;

  await prisma.absenceRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  redirect("/dashboard");
}
