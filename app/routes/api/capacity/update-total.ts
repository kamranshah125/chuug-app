import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const data = await request.json();
  const { totalCapacity } = data;

  // Example update logic
  return json({ success: true, message: `Total capacity updated to ${totalCapacity}` });
};
