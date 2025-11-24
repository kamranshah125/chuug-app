import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const data = await request.json();
  const { usedIncrease } = data;

  return json({ success: true, message: `Used capacity increased by ${usedIncrease}` });
};
