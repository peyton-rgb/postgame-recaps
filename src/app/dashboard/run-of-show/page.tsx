import { redirect } from "next/navigation";

export default function RunOfShowDashboard() {
  redirect("/dashboard?tab=ros");
}
