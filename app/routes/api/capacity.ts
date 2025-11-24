import { json } from "@remix-run/node";
import prisma from "app/db.server";

// Helper: skip weekends
const isWeekend = (date: Date) => [0, 6].includes(date.getDay());

// GET /api/capacity/next
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "next") {
    const capacities = await prisma.capacity.findMany({
      orderBy: { date: "asc" },
    });
    const next = capacities.find(
      (c) => !isWeekend(new Date(c.date)) && c.usedCapacity < c.totalCapacity,
    );
    if (!next) return json({ message: "No available day" }, { status: 404 });
    return json({
      availableDate: next.date,
      remaining: next.totalCapacity - next.usedCapacity,
    });
  }

  // GET report
  const { startDate, endDate } = Object.fromEntries(url.searchParams.entries());
  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();

  const capacities = await prisma.capacity.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });

  const summary = {
    totalCapacity: capacities.reduce((sum, c) => sum + c.totalCapacity, 0),
    usedCapacity: capacities.reduce((sum, c) => sum + c.usedCapacity, 0),
    remainingCapacity: capacities.reduce(
      (sum, c) => sum + (c.totalCapacity - c.usedCapacity),
      0,
    ),
  };

  return json({ summary, data: capacities });
}

// POST /api/capacity
export async function action({ request }: { request: Request }) {
  const data = await request.json();
  const { type } = data;

  if (type === "create") {
    const { totalCapacity, days = 30 } = data;
    const today = new Date();
    const capacities = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (isWeekend(date)) continue;

      const existing = await prisma.capacity.findFirst({ where: { date } });
      if (!existing) {
        const newCap = await prisma.capacity.create({
          data: { date, totalCapacity, usedCapacity: 0 },
        });
        capacities.push(newCap);
      }
    }
    return json({
      message: "Capacity initialized",
      created: capacities.length,
    });
  }

  if (type === "updateUsed") {
    const { usedIncrease = 1 } = data;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const capacities = await prisma.capacity.findMany({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
    });
    const next = capacities.find(
      (c) => !isWeekend(new Date(c.date)) && c.usedCapacity < c.totalCapacity,
    );

    if (!next)
      return json({ message: "No available despatch day", status: 404 });
    const updated = await prisma.capacity.update({
      where: { id: next.id },
      data: { usedCapacity: next.usedCapacity + usedIncrease },
    });

    return json({
      message: "Used capacity updated",
      updatedDate: next.date,
      updated,
    });
  }

  if (type === "updateTotal") {
    const { totalCapacity, fromDate, toDate } = data;
    const startDate = fromDate ? new Date(fromDate) : new Date();
    const endDate = toDate
      ? new Date(toDate)
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    let updatedCount = 0,
      createdCount = 0;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (isWeekend(d)) continue;
      const isoDate = d.toISOString().split("T")[0];
      const existing = await prisma.capacity.findFirst({ where: { date: d } });

      if (existing) {
        await prisma.capacity.update({
          where: { id: existing.id },
          data: { totalCapacity },
        });
        updatedCount++;
      } else {
        await prisma.capacity.create({
          data: { date: d, totalCapacity, usedCapacity: 0 },
        });
        createdCount++;
      }
    }
    return json({
      message: `Updated ${updatedCount}, Created ${createdCount}`,
    });
  }

  return json({ message: "Invalid action type" }, { status: 400 });
}
