import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (userId) {
    redirect("/profile");
  }
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-lg w-full p-8 bg-white rounded shadow">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Welcome to NEWWORK HR Demo
        </h1>
        <p className="mb-6 text-center text-gray-700">
          This is a demo Employee Profile app. Please login to view your profile
          and features.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="w-full bg-blue-600 text-white py-2 rounded text-center font-semibold"
          >
            Login
          </Link>
          <Link
            href="/profile"
            className="w-full bg-gray-200 text-blue-600 py-2 rounded text-center font-semibold"
          >
            Profile
          </Link>
        </div>
      </div>
    </main>
  );
}
