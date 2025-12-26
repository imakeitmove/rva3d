// app/portfolio/page.tsx
import { redirect } from "next/navigation";

export const runtime = "edge";

export default function PortfolioRedirect() {
  return redirect("/work");
}
