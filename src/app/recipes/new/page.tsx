import { redirect } from "next/navigation";
import NewRecipeForm from "@/components/NewRecipeForm";
import { getCurrentUser } from "@/lib/session";

export default async function NewRecipePage() {
  if (!(await getCurrentUser())) redirect("/sign-in?next=/recipes/new");
  return <NewRecipeForm />;
}
