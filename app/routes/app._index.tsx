import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Ensure the user is authenticated first
  await authenticate.admin(request);

  // Redirect to the dashboard
  return redirect("/app/dashboard");
};

// Component must render nothing
export default function AppIndex(): JSX.Element | null {
  return null;
}
