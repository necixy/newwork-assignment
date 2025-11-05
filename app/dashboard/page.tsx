import { cookies } from "next/headers";
import { PrismaClient, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { submitFeedbackAction } from "./feedbackAction";
import {
  requestAbsenceAction,
  approveAbsenceAction,
  rejectAbsenceAction,
} from "./absenceAction";
import Link from "next/link";

const prisma = new PrismaClient();

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) redirect("/login");

  const user = await prisma.employee.findUnique({
    where: { id: userId },
    include: {
      feedbacks: { include: { author: true } },
      absenceRequests: true,
    },
  });
  if (!user) redirect("/login");

  const isManager = user.role === Role.MANAGER;
  const isCoworker = user.role === Role.COWORKER;
  const isEmployee = user.role === Role.EMPLOYEE;

  // Manager view: show all employees in a table
  if (isManager) {
    const allEmployees = await prisma.employee.findMany({
      include: {
        absenceRequests: true,
        feedbacks: true,
      },
    });

    const allAbsenceRequests = await prisma.absenceRequest.findMany({
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });

    const pendingRequests = allAbsenceRequests.filter(
      (r) => r.status === "PENDING"
    );
    const stats = {
      totalEmployees: allEmployees.length,
      pendingAbsences: pendingRequests.length,
      totalFeedback: allEmployees.reduce(
        (acc, emp) => acc + emp.feedbacks.length,
        0
      ),
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                HR Dashboard
              </h1>
              <p className="text-base text-slate-600">
                Welcome back, {user.name}
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 text-slate-700 font-medium"
            >
              My Profile
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Total Employees
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.totalEmployees}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Pending Absences
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.pendingAbsences}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Total Feedback
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.totalFeedback}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <section className="mb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">
                  All Employees
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your team members
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {allEmployees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">
                            {emp.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {emp.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              emp.role === "MANAGER"
                                ? "bg-purple-100 text-purple-800"
                                : emp.role === "COWORKER"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {emp.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {emp.phone || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/dashboard/${emp.id}`}
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                          >
                            View Details →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Absence Requests Table */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">
                  Absence Requests
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Review and manage time-off requests
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {allAbsenceRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">
                            {req.employee.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {new Date(req.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {new Date(req.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {req.status === "PENDING" && (
                            <div className="flex gap-2">
                              <form action={approveAbsenceAction}>
                                <input
                                  type="hidden"
                                  name="requestId"
                                  value={req.id}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Employee view: own profile and absence requests
  if (isEmployee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                My Dashboard
              </h1>
              <p className="text-base text-slate-600">
                Welcome back, {user.name}
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 text-slate-700 font-medium"
            >
              My Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  My Profile
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Name
                    </label>
                    <p className="text-lg font-medium text-slate-900">
                      {user.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Email
                    </label>
                    <p className="text-lg font-medium text-slate-900">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Position
                    </label>
                    <p className="text-lg font-medium text-slate-900">
                      {user.position}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Role
                    </label>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Phone
                    </label>
                    <p className="text-lg font-medium text-slate-900">
                      {user.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Address
                    </label>
                    <p className="text-lg font-medium text-slate-900">
                      {user.address || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Absence Requests */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  My Absence Requests
                </h2>
                <div className="mb-6">
                  {user.absenceRequests.length > 0 ? (
                    <div className="space-y-3">
                      {user.absenceRequests.map((req) => (
                        <div
                          key={req.id}
                          className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {new Date(req.startDate).toLocaleDateString()} –{" "}
                              {new Date(req.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              Submitted{" "}
                              {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded-full ${
                              req.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : req.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      No absence requests yet.
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Request New Absence
                  </h3>
                  <form action={requestAbsenceAction} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          required
                          className="block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          required
                          className="block w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all shadow-sm"
                    >
                      Submit Request
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Feedback Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:sticky lg:top-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Feedback Received
                </h2>
                {user.feedbacks.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {user.feedbacks.map((fb) => (
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
                        <p className="text-slate-700 text-sm leading-relaxed">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Co-worker view: browse employees (non-sensitive) and leave feedback
  if (isCoworker) {
    const allEmployees = await prisma.employee.findMany({
      include: {
        feedbacks: { include: { author: true } },
      },
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                Employee Directory
              </h1>
              <p className="text-base text-slate-600">
                Browse and provide feedback to your colleagues
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 text-slate-700 font-medium"
            >
              My Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {allEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-200"
              >
                {/* Employee Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
                    {emp.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {emp.name}
                    </h3>
                    <p className="text-slate-600">{emp.position}</p>
                    <p className="text-sm text-slate-500 mt-1">{emp.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      emp.role === "MANAGER"
                        ? "bg-purple-100 text-purple-800"
                        : emp.role === "COWORKER"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {emp.role}
                  </span>
                </div>

                {/* Recent Feedback */}
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2">
                    Recent Feedback
                  </h4>
                  {emp.feedbacks.length > 0 ? (
                    <div className="space-y-2">
                      {emp.feedbacks.slice(0, 2).map((fb) => (
                        <div
                          key={fb.id}
                          className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed border border-slate-100"
                        >
                          "{fb.polishedText || fb.text}"
                          <p className="text-xs text-slate-500 mt-1">
                            — {fb.author.name}
                          </p>
                        </div>
                      ))}
                      {emp.feedbacks.length > 2 && (
                        <p className="text-xs text-slate-500">
                          +{emp.feedbacks.length - 2} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No feedback yet. Be the first!
                    </p>
                  )}
                </div>

                {/* Feedback Form */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-800 text-sm mb-3">
                    Leave Feedback
                  </h4>
                  <form action={submitFeedbackAction} className="space-y-3">
                    <input type="hidden" name="employeeId" value={emp.id} />
                    <textarea
                      name="text"
                      placeholder="Share your thoughts..."
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      required
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          name="polish"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex items-center gap-1">
                          ✨ Polish with AI
                        </span>
                      </label>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
