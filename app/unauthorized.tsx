import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">401</h1>
      <p className="text-muted-foreground mt-2">Unauthorized</p>
      <Button asChild className="mt-6">
        <Link href="/login">Sign In</Link>
      </Button>
    </div>
  );
}
