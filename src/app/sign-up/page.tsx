import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { safeReturnPath } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";

export default async function SignUp({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeReturnPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return <AuthForm mode="sign-up" next={next} />;
}
