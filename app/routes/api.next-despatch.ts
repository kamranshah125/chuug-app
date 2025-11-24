// import { DateTime } from "luxon";
// import prisma from "app/db.server";
// import { LoaderFunctionArgs } from "react-router";

// // ---- TYPES ----
// type CountryOverride = {
//   [country: string]: {
//     despatchLead?: number;
//     deliveryLead?: number;
//   };
// };

// type StoreSettings = {
//   shop: string;
//   timezone?: string;
//   defaultDespatchLead?: number;
//   defaultDeliveryLead?: number;
//   countryOverrides?: CountryOverride;
// };

// // ---- HELPERS ----

// export function getLeadTimes(settings: StoreSettings | null, country: string) {
//   const countryOverrides =
//     (settings?.countryOverrides as CountryOverride | undefined) ?? undefined;

//   const override = countryOverrides?.[country];

//   const despatchLead =
//     override?.despatchLead ?? settings?.defaultDespatchLead ?? 1;

//   const deliveryLead =
//     override?.deliveryLead ?? settings?.defaultDeliveryLead ?? 2;

//   return { despatchLead, deliveryLead };
// }

// // ---- LOADER ----

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const url = new URL(request.url);
//   const shopParam = url.searchParams.get("shop");
//   const country = url.searchParams.get("country") || "GB";

//   // ---- FIX 1: Convert null → undefined (Prisma requires string | undefined)
//   const shop =
//   request.headers.get("x-shop-domain") ||
//   process.env.SHOP ||
//   "chuug-2.myshopify.com"; // your dev store

//   // Fetch store settings
//   const settings = (await prisma.storeSettings.findUnique({
//     where: { shop },
//   })) as StoreSettings | null;

//   const tz = settings?.timezone || "Europe/London";

//   // Use helper safely
//   const { despatchLead, deliveryLead } = getLeadTimes(settings, country);

//   // Start from today in store timezone
//   let cursor = DateTime.now().setZone(tz).startOf("day");

//   // Loop ahead for a maximum of 60 days
//   for (let i = 0; i < 60; i++) {
//     // Only Mon–Fri for despatch
//     if (cursor.weekday >= 1 && cursor.weekday <= 5) {
//       // Normalize date for DB lookup
//       const dateUtc = cursor.toUTC().toJSDate();

//       const cap = await prisma.capacity.findUnique({
//         where: { date: dateUtc },
//       });

//       if (cap && !cap.closed && cap.usedCapacity < cap.totalCapacity) {
//         // FOUND DESPATCH DATE

//         // Calculate delivery date (Mon–Sat only, skip Sundays)
//         let delivery = cursor;
//         let added = 0;
//         while (added < deliveryLead) {
//           delivery = delivery.plus({ days: 1 });
//           if (delivery.weekday !== 7) added++; // skip Sundays
//         }

//         return Response.json({
//           despatchDateISO: cursor.toISODate(),
//           despatchDateText: cursor.toFormat("d LLLL yyyy"),
//           deliveryDateISO: delivery.toISODate(),
//           deliveryDateText: delivery.toFormat("d LLLL yyyy"),
//           remaining: cap.totalCapacity - cap.usedCapacity,
//         });
//       }
//     }

//     // Move to next day
//     cursor = cursor.plus({ days: 1 });
//   }

//   return Response.json(
//     { error: "No available despatch date found" },
//     { status: 404 }
//   );
// };
// app/routes/api.next-despatch.ts
import prisma from "app/db.server";
import { DateTime } from "luxon";
import type { LoaderFunctionArgs } from "react-router";
import { getLeadTimes } from "app/services/allocationService";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const country = url.searchParams.get("country") ?? "GB";

  // Load the only store’s settings
  const settings = await prisma.storeSettings.findFirst();

  if (!settings) {
    return Response.json(
      { error: "Store settings not found" },
      { status: 500 }
    );
  }

  const tz = settings.timezone ?? "Europe/London";
  const { despatchLead, deliveryLead } = await getLeadTimes(settings, country);

  // Find next available despatch date
  let cursor = DateTime.now().setZone(tz).startOf("day");

  for (let i = 0; i < 60; i++) {
    if (cursor.weekday >= 1 && cursor.weekday <= 5) {
      const dateUtc = cursor.toUTC().toJSDate();
      const cap = await prisma.capacity.findUnique({
        where: { date: dateUtc },
      });

      if (cap && !(cap as any).closed && cap.usedCapacity < cap.totalCapacity) {
        // Calculate delivery date (skip Sundays)
        let delivery = cursor;
        let added = 0;
        while (added < deliveryLead) {
          delivery = delivery.plus({ days: 1 });
          if (delivery.weekday !== 7) added++;
        }

        return Response.json({
          despatchDateISO: cursor.toISODate(),
          despatchDateText: cursor.toFormat("d LLLL yyyy"),
          deliveryDateISO: delivery.toISODate(),
          deliveryDateText: delivery.toFormat("d LLLL yyyy"),
          remaining: cap.totalCapacity - cap.usedCapacity,
        });
      }
    }

    cursor = cursor.plus({ days: 1 });
  }

  return Response.json(
    { error: "No available despatch date" },
    { status: 404 }
  );
}
