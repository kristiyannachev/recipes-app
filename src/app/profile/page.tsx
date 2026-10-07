import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { getCurrentUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/profile");
  return <ProfileForm user={user} />;
}
