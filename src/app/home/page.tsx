import HomePage from "./homepage/page";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/auth/login");
  }
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.name}</h1>
      <p>Your role is: {session.user.role}</p>
      <HomePage />
    </main>
  );
}
