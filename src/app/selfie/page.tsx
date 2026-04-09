import { redirect } from "next/navigation";

export default function SelfiePage() {
  redirect("/explore?view=map");
}
