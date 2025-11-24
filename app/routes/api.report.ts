import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";
// import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // await authenticate.admin(request);

  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  // Build where clause
  let whereClause: any = {};
  if (startDate && endDate) {
    whereClause.date = { gte: new Date(startDate), lte: new Date(endDate) };
  } else if (startDate) {
    const d = new Date(startDate);
    d.setUTCHours(0, 0, 0, 0);
    whereClause.date = d;
  }

  // Fetch from DB
  const capacities = await prisma.capacity.findMany({
    where: whereClause,
    orderBy: { date: "asc" },
  });

  // Map to frontend format
  const report = capacities.map((c) => ({
    date: c.date,
    used: c.usedCapacity,
    total: c.totalCapacity,
  }));

  return Response.json({ success: true, report });
};
