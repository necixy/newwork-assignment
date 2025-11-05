import { PrismaClient, Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function updateEmployeeAction(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const user = await prisma.employee.findUnique({
    where: { id: userId },
  });
  if (!user) redirect("/login");

  const employeeId = formData.get("employeeId") as string;
  const isManager = user.role === Role.MANAGER;
  const isOwner = user.id === employeeId;

  if (!isManager && !isOwner) {
    redirect("/dashboard");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const position = formData.get("position") as string;
  const role = formData.get("role") as Role;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      name,
      email,
      position,
      role,
      phone: phone || null,
      address: address || null,
    },
  });

  redirect(`/dashboard/${employeeId}`);
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
  }

  const requestId = formData.get("requestId") as string;
  const employeeId = formData.get("employeeId") as string;

  await prisma.absenceRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" },
  });

  redirect(`/dashboard/${employeeId}`);
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
  }

  const requestId = formData.get("requestId") as string;
  const employeeId = formData.get("employeeId") as string;

  await prisma.absenceRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  redirect(`/dashboard/${employeeId}`);
}
