import { json } from "@remix-run/node";
import prisma from "app/db.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

// =============================
// GET /api/capacity/list
// =============================
export async function loader({ request }: LoaderFunctionArgs) {
  const capacities = await prisma.capacity.findMany();
  return Response.json(capacities);
}

// =============================
// POST + PUT actions
// =============================
export async function action({ request }: ActionFunctionArgs) {
  const method = request.method;

  // ===================================================
  // 1️⃣  PUT Request → Either FILL ORDERS or UPDATE CAPACITY
  // ===================================================
  if (method === "PUT") {
    const body = await request.json();

    // ===============================
// A) FILL ORDERS (usedIncrease)
// ===============================
if (body.usedIncrease) {
  const usedIncrease = parseInt(body.usedIncrease);

  // Make sure orders ALWAYS start from TODAY
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find next working day starting from TODAY
  const nextDay = await prisma.capacity.findFirst({
    where: {
      date: { gte: today },  // 👈 ONLY future or today
      usedCapacity: { lt: prisma.capacity.fields.totalCapacity }, // space available
    },
    orderBy: { date: "asc" },
  });

  if (!nextDay) {
    return Response.json(
      { message: "❌ No available dispatch day" },
      { status: 400 }
    );
  }

  // Update used capacity
  await prisma.capacity.update({
    where: { id: nextDay.id },
    data: {
      usedCapacity: nextDay.usedCapacity + usedIncrease,
    },
  });

  return Response.json({
    message: "Order filled",
    updatedDate: nextDay.date,
  });
}


    // ===============================
    // B) UPDATE TOTAL CAPACITY
    // ===============================
    const { totalCapacity, fromDate, toDate } = body;

    if (!totalCapacity) {
      return Response.json(
        { message: "❌ totalCapacity is required" },
        { status: 400 }
      );
    }

    const startDate = fromDate ? new Date(fromDate) : new Date();
    const endDate = toDate ? new Date(toDate) : null;

    startDate.setUTCHours(0, 0, 0, 0);
    if (endDate) endDate.setUTCHours(23, 59, 59, 999);

    let whereClause: any;
    if (endDate) {
      whereClause = { date: { gte: startDate, lte: endDate } };
    } else if (fromDate) {
      whereClause = { date: startDate };
    } else {
      whereClause = { date: { gte: startDate } };
    }

    const existingCaps = await prisma.capacity.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    let updatedCount = 0;
    let createdCount = 0;

    let loopEnd = endDate ? new Date(endDate) : new Date(startDate);
    if (!endDate && !fromDate)
      loopEnd.setDate(startDate.getDate() + 30);

    // Loop through dates
    for (
      let d = new Date(startDate);
      d <= loopEnd;
      d.setDate(d.getDate() + 1)
    ) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      const isoDate = d.toISOString().split("T")[0];

      const existing = existingCaps.find(
        (c) => new Date(c.date).toISOString().split("T")[0] === isoDate
      );

      if (existing) {
        await prisma.capacity.update({
          where: { id: existing.id },
          data: { totalCapacity: parseInt(totalCapacity) },
        });
        updatedCount++;
      } else {
        await prisma.capacity.create({
          data: {
            date: new Date(d),
            totalCapacity: parseInt(totalCapacity),
            usedCapacity: 0,
          },
        });
        createdCount++;
      }
    }

    let message;
    if (endDate) {
      message = `Capacity updated for ${updatedCount} and created for ${createdCount} working days between ${startDate.toISOString().split("T")[0]} and ${endDate.toISOString().split("T")[0]}.`;
    } else if (fromDate) {
      message = `Capacity updated/created for ${updatedCount + createdCount} record(s) on ${startDate.toISOString().split("T")[0]}.`;
    } else {
      message = `Capacity updated for ${updatedCount} and created for ${createdCount} working days starting from ${startDate.toISOString().split("T")[0]}.`;
    }

    return Response.json({
      message,
      updatedCount,
      createdCount,
    });
  }

  // ===================================================
  // 2️⃣  POST → Create working days
  // ===================================================
  const { totalCapacity, days = 30 } = await request.json();

  const today = new Date();
  const capacities = [];

  let createdDays = 0;
  let offset = 0;

  while (createdDays < days) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    const dayOfWeek = date.getDay();
    offset++;

    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateOnly = new Date(date.toISOString().split("T")[0]);

    const existing = await prisma.capacity.findFirst({
      where: { date: dateOnly },
    });

    if (!existing) {
      const newCap = await prisma.capacity.create({
        data: {
          date: dateOnly,
          totalCapacity: parseInt(totalCapacity),
          usedCapacity: 0,
        },
      });
      capacities.push(newCap);
    }

    createdDays++;
  }

  return Response.json({
    message: `Capacity initialized for next ${days} working days.`,
    created: capacities.length,
  });
}
