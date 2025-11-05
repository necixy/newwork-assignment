import { PrismaClient, Role, AbsenceStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Employees
  type EmployeeSeed = {
    name: string;
    email: string;
    role: Role;
    position: string;
    phone?: string;
    address?: string;
  };

  const employeesData: EmployeeSeed[] = [
    // Managers
    {
      name: "Alice Manager",
      email: "alice.manager@example.com",
      role: Role.MANAGER,
      position: "HR Manager",
      phone: "123-456-7890",
      address: "123 Main St, City",
    },
    {
      name: "David Manager",
      email: "david.manager@example.com",
      role: Role.MANAGER,
      position: "Operations Manager",
      phone: "321-654-0987",
      address: "789 Oak St, City",
    },
    // Employees
    {
      name: "Bob Employee",
      email: "bob.employee@example.com",
      role: Role.EMPLOYEE,
      position: "Software Engineer",
      phone: "987-654-3210",
      address: "456 Elm St, City",
    },
    {
      name: "Eve Employee",
      email: "eve.employee@example.com",
      role: Role.EMPLOYEE,
      position: "QA Analyst",
      phone: "555-123-4567",
      address: "101 Pine St, City",
    },
    {
      name: "Frank Employee",
      email: "frank.employee@example.com",
      role: Role.EMPLOYEE,
      position: "DevOps Engineer",
      phone: "444-222-1111",
      address: "202 Maple St, City",
    },
    // Coworkers
    {
      name: "Charlie Coworker",
      email: "charlie.coworker@example.com",
      role: Role.COWORKER,
      position: "Product Designer",
    },
    {
      name: "Grace Coworker",
      email: "grace.coworker@example.com",
      role: Role.COWORKER,
      position: "UX Researcher",
    },
  ];

  const employees: Record<
    string,
    Awaited<ReturnType<typeof prisma.employee.create>>
  > = {};
  for (const emp of employeesData) {
    const created = await prisma.employee.create({ data: emp });
    employees[created.email] = created;
  }

  // Create Feedbacks
  const feedbacksData = [
    {
      text: "Great teamwork!",
      polishedText: "Excellent collaboration and support.",
      authorId: employees["charlie.coworker@example.com"].id,
      employeeId: employees["bob.employee@example.com"].id,
    },
    {
      text: "Very helpful during onboarding.",
      polishedText: "Provided outstanding support for new hires.",
      authorId: employees["grace.coworker@example.com"].id,
      employeeId: employees["eve.employee@example.com"].id,
    },
    {
      text: "Quick to resolve issues.",
      polishedText: "Demonstrates excellent problem-solving skills.",
      authorId: employees["charlie.coworker@example.com"].id,
      employeeId: employees["frank.employee@example.com"].id,
    },
    {
      text: "Always positive and energetic.",
      polishedText: "Brings great energy to the team.",
      authorId: employees["grace.coworker@example.com"].id,
      employeeId: employees["bob.employee@example.com"].id,
    },
    {
      text: "Excellent leadership.",
      polishedText: "Shows strong leadership and management skills.",
      authorId: employees["bob.employee@example.com"].id,
      employeeId: employees["alice.manager@example.com"].id,
    },
  ];

  for (const fb of feedbacksData) {
    await prisma.feedback.create({ data: fb });
  }

  // Create Absence Requests
  const absenceRequestsData = [
    {
      employee: { connect: { id: employees["bob.employee@example.com"].id } },
      startDate: new Date("2025-11-10"),
      endDate: new Date("2025-11-15"),
      status: AbsenceStatus.PENDING,
    },
    {
      employee: { connect: { id: employees["eve.employee@example.com"].id } },
      startDate: new Date("2025-12-01"),
      endDate: new Date("2025-12-05"),
      status: AbsenceStatus.APPROVED,
    },
    {
      employee: { connect: { id: employees["frank.employee@example.com"].id } },
      startDate: new Date("2025-11-20"),
      endDate: new Date("2025-11-22"),
      status: AbsenceStatus.REJECTED,
    },
    {
      employee: { connect: { id: employees["bob.employee@example.com"].id } },
      startDate: new Date("2026-01-10"),
      endDate: new Date("2026-01-12"),
      status: AbsenceStatus.APPROVED,
    },
    {
      employee: { connect: { id: employees["eve.employee@example.com"].id } },
      startDate: new Date("2026-02-15"),
      endDate: new Date("2026-02-18"),
      status: AbsenceStatus.PENDING,
    },
  ];

  for (const ar of absenceRequestsData) {
    await prisma.absenceRequest.create({ data: ar });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
