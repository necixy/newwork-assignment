import { cookies } from "next/headers";
import { PrismaClient, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  updateEmployeeAction,
  approveAbsenceAction,
  rejectAbsenceAction,
} from "./employeeActions";

const prisma = new PrismaClient();

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const user = await prisma.employee.findUnique({
    where: { id: userId },
  });
  if (!user) redirect("/login");

  // Only managers and profile owners can view this page
  const isManager = user.role === Role.MANAGER;
  const isOwner = user.id === id;

  if (!isManager && !isOwner) {
    redirect("/dashboard");
  }

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      feedbacks: { include: { author: true } },
      absenceRequests: true,
    },
  });

  if (!employee) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              {employee.name}
            </h1>
            <p className="text-slate-600">
              {employee.position} • {employee.email}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-slate-200 flex items-center gap-2"
          >
            ← Back
          </Link>
        </div>

        {/* Profile Edit Form */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              Profile Information
            </h2>
            <form action={updateEmployeeAction} className="space-y-6">
              <input type="hidden" name="employeeId" value={employee.id} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={employee.name}
                    className="block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={employee.email}
                    className="block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    defaultValue={employee.position}
                    className="block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    defaultValue={employee.role}
                    className="block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="COWORKER">Co-worker</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={employee.phone || ""}
                    className="block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={employee.address || ""}
                    className="block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm"
                >
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Feedback */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Feedback
            </h2>
            {employee.feedbacks.length > 0 ? (
              <div className="space-y-3">
                {employee.feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700">
                        {fb.author.name.charAt(0)}
                      </div>
                      <div className="font-semibold text-slate-900">
                        {fb.author.name}
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {fb.polishedText || fb.text}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                No feedback yet.
              </p>
            )}
          </div>
        </section>

        {/* Absence Requests */}
        <section>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-800">
                Absence Requests
              </h2>
            </div>
            {employee.absenceRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      {isManager && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {employee.absenceRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {new Date(req.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {new Date(req.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              req.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : req.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        {isManager && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {req.status === "PENDING" && (
                              <div className="flex gap-2">
                                <form action={approveAbsenceAction}>
                                  <input
                                    type="hidden"
                                    name="requestId"
                                    value={req.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="employeeId"
                                    value={employee.id}
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                                  >
                                    ✓ Approve
                                  </button>
                                </form>
                                <form action={rejectAbsenceAction}>
                                  <input
                                    type="hidden"
                                    name="requestId"
                                    value={req.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="employeeId"
                                    value={employee.id}
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                  >
                                    ✗ Reject
                                  </button>
                                </form>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                No absence requests.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
