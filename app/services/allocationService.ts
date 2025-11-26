// app/services/allocationService.ts
import { DateTime } from "luxon";
import prisma from "app/db.server";

type AllocationResult = {
  despatchDateISO: string;
  despatchDateText: string;
  deliveryDateISO: string;
  deliveryDateText: string;
  capacityId: number;
};

export async function getLeadTimes(settings: any, country = "GB") {
  const co = (settings?.countryOverrides ?? {}) as Record<
    string,
    { despatchLead?: number; deliveryLead?: number }
  >;
  const override = co[country] ?? {};
  return {
    despatchLead: override.despatchLead ?? settings?.defaultDespatchLead ?? 1,
    deliveryLead: override.deliveryLead ?? settings?.defaultDeliveryLead ?? 2,
    timezone: settings?.timezone ?? "Europe/London",
  };
}

/**
 * Find next available despatch slot FROM today (store timezone) and allocate.
 * usedIncrease: how many orders to consume (default 1).
 * Optional orderId to attach.
 */
export async function findAndAllocateNextAvailable({
  shop,
  country = "GB",
  usedIncrease = 1,
  orderId,
}: {
  shop?: string;
  country?: string;
  usedIncrease?: number;
  orderId?: string;
}): Promise<AllocationResult | null> {
  // load settings
 const settings = await prisma.storeSettings.findFirst({
  where: { shop: shop } // shopValue must be string
});
  const { despatchLead, deliveryLead, timezone } = await getLeadTimes(
    settings,
    country
  );

  // start from today in store timezone
  let cursor = DateTime.now().setZone(timezone).startOf("day");

  const maxDays = 90;
  for (let i = 0; i < maxDays; i++) {
    // only Mon-Fri
    if (cursor.weekday >= 1 && cursor.weekday <= 5) {
      const dateUtc = cursor.toUTC().toJSDate();

      // transaction: check capacity and update usedCapacity atomically
      const result = await prisma.$transaction(async (tx) => {
        const cap = await tx.capacity.findUnique({ where: { date: dateUtc } });
        if (!cap || (cap as any).closed) return null;
        if (cap.usedCapacity + usedIncrease > cap.totalCapacity) return null;

        const updatedCap = await tx.capacity.update({
          where: { id: cap.id },
          data: { usedCapacity: cap.usedCapacity + usedIncrease },
        });

        const alloc = await tx.allocation.create({
          data: {
            orderId: orderId ?? "",
            capacityId: cap.id,
            despatchDate: dateUtc,
          },
        });

        return { updatedCap, allocId: alloc.id, capId: cap.id };
      });

      if (result) {
        // compute delivery date counting Mon-Sat (skip Sundays)
        let delivery = cursor;
        let added = 0;
        while (added < deliveryLead) {
          delivery = delivery.plus({ days: 1 });
          if (delivery.weekday !== 7) added++;
        }
        return {
          despatchDateISO: cursor.toISODate() ?? "",
          despatchDateText: cursor.toFormat("d LLLL yyyy"),
          deliveryDateISO: delivery.toISODate() ?? "",
          deliveryDateText: delivery.toFormat("d LLLL yyyy"),
          capacityId: result.capId,
        };
      }
    }
    cursor = cursor.plus({ days: 1 });
  }
  return null;
}
