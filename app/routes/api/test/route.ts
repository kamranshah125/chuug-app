import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // await authenticate.admin(request);

  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  // Example fake data
  const report = [
    { date: startDate, used: 10, total: 100 },
    { date: endDate, used: 12, total: 100 },
  ];

  return json({ success: true, report });
};
