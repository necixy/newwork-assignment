import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set("userId", "", { path: "/", expires: new Date(0) });
  cookieStore.set("userRole", "", { path: "/", expires: new Date(0) });
  redirect("/");
}

const prisma = new PrismaClient();

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  if (!userId) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
        Please log in to view your profile.
      </div>
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { id: userId },
    include: { feedbacks: true, absenceRequests: true },
  });

  if (!employee) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
        User not found.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <form action={logoutAction}>
        <button
          type="submit"
          className="mb-4 w-full bg-red-600 text-white py-2 rounded font-semibold"
        >
          Logout
        </button>
      </form>
      <p>
        <strong>Name:</strong> {employee.name}
      </p>
      <p>
        <strong>Email:</strong> {employee.email}
      </p>
      <p>
        <strong>Position:</strong> {employee.position}
      </p>
      <p>
        <strong>Role:</strong> {employee.role}
      </p>
      {userRole !== "COWORKER" && (
        <>
          <p>
            <strong>Phone:</strong> {employee.phone}
          </p>
          <p>
            <strong>Address:</strong> {employee.address}
          </p>
        </>
      )}
      <div className="mt-4">
        <h3 className="font-semibold">Feedbacks</h3>
        <ul className="list-disc ml-6">
          {employee.feedbacks.map((fb) => (
            <li key={fb.id}>{fb.polishedText || fb.text}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Absence Requests</h3>
        <ul className="list-disc ml-6">
          {employee.absenceRequests.map((ar) => (
            <li key={ar.id}>
              {ar.startDate.toLocaleDateString()} -{" "}
              {ar.endDate.toLocaleDateString()} ({ar.status})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
