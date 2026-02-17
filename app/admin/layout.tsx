import { getRequiredAdmin } from "@/lib/auth/auth-user";
import { AdminNavigation } from "./_navigation/admin-navigation";

export default async function AdminLayout(props: LayoutProps<"/admin">) {
  await getRequiredAdmin();

  return <AdminNavigation>{props.children}</AdminNavigation>;
}
