import { redirect } from "next/navigation";

// Create flow is now handled via the + button dialog on /dashboard/lists
export default function CreateListPage() {
  redirect("/dashboard/lists");
}
