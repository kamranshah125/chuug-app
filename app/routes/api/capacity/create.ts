import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const data = await request.json();
  const { totalCapacity, usedCapacity } = data;

  // Replace this with your actual DB save logic
  const newEntry = {
    id: Date.now(),
    totalCapacity,
    usedCapacity,
  };

  return json({ success: true, entry: newEntry });
};
