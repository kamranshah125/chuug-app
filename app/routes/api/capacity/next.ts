import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server"; 

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Example logic for fetching next delivery slot, etc.
  return json({ success: true, nextSlot: "2025-11-15T10:00:00Z" });
};
