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

//Current ....................
// import prisma from "app/db.server";
// import { DateTime } from "luxon";
// import type { LoaderFunctionArgs } from "react-router";
// import { getLeadTimes } from "app/services/allocationService";

// export async function loader({ request }: LoaderFunctionArgs) {
//   const url = new URL(request.url);
//   const country = url.searchParams.get("country") ?? "GB";

//   // Load the only store’s settings
//   const settings = await prisma.storeSettings.findFirst();

//   if (!settings) {
//     return Response.json(
//       { error: "Store settings not found" },
//       { status: 500 }
//     );
//   }

//   const tz = settings.timezone ?? "Europe/London";
//   const { despatchLead, deliveryLead } = await getLeadTimes(settings, country);

//   // Find next available despatch date
//   let cursor = DateTime.now().setZone(tz).startOf("day");

//   for (let i = 0; i < 60; i++) {
//     if (cursor.weekday >= 1 && cursor.weekday <= 5) {
//       const dateUtc = cursor.toUTC().toJSDate();
//       const cap = await prisma.capacity.findUnique({
//         where: { date: dateUtc },
//       });

//       if (cap && !(cap as any).closed && cap.usedCapacity < cap.totalCapacity) {
//         // Calculate delivery date (skip Sundays)
//         let delivery = cursor;
//         let added = 0;
//         while (added < deliveryLead) {
//           delivery = delivery.plus({ days: 1 });
//           if (delivery.weekday !== 7) added++;
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

//     cursor = cursor.plus({ days: 1 });
//   }

//   return Response.json(
//     { error: "No available despatch date" },
//     { status: 404 }
//   );
// }


//liveee version.................................

// updated version.................................
import prisma from "app/db.server";
import { DateTime } from "luxon";
import type { LoaderFunctionArgs } from "react-router";
import { getLeadTimes } from "app/services/allocationService";

function corsResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const url = new URL(request.url);
    const country = url.searchParams.get("country") ?? "GB";

    const settings = await prisma.storeSettings.findFirst();

    if (!settings) {
      return corsResponse(
        { error: "Store settings not found" },
        500
      );
    }

    const tz = settings.timezone ?? "Europe/London";
    const { despatchLead, deliveryLead } = await getLeadTimes(settings, country);

    // ----- 1) "Now" and base day (cutoff-aware) -----
    const now = DateTime.now().setZone(tz);
    let baseDay = now.startOf("day");

    const cutoffStr = (settings as any).despatchCutoffTime as string | null;

    if (cutoffStr) {
      // Expect format "HH:mm" in store timezone
      const cutoffToday = DateTime.fromFormat(cutoffStr, "HH:mm", { zone: tz }).set({
        year: now.year,
        month: now.month,
        day: now.day,
      });

      // If we've passed the cutoff, we can't despatch "today" anymore – start from tomorrow
      if (now > cutoffToday) {
        baseDay = baseDay.plus({ days: 1 });
      }
    }

    // ----- 2) Apply despatchLead (today + despatchLead, weekdays only) -----
    let cursor = baseDay;
    let leadAdded = 0;

    while (leadAdded < despatchLead) {
      cursor = cursor.plus({ days: 1 });

      // Only count Mon–Fri as valid despatch "lead" days
      if (cursor.weekday >= 1 && cursor.weekday <= 5) {
        leadAdded++;
      }
    }

    // At this point, `cursor` = (today or tomorrow based on cutoff) + despatchLead (weekdays)
    // Now search for first day with available capacity FROM that cursor onwards.

    // ----- 3) Find next available despatch date with capacity -----
    for (let i = 0; i < 60; i++) {
      if (cursor.weekday >= 1 && cursor.weekday <= 5) {
        const dateUtc = cursor.toUTC().toJSDate();
        const cap = await prisma.capacity.findUnique({
          where: { date: dateUtc },
        });

        if (cap && !(cap as any).closed && cap.usedCapacity < cap.totalCapacity) {
          // ----- 4) Calculate delivery date (skip Sundays) -----
          let delivery = cursor;
          let added = 0;

          while (added < deliveryLead) {
            delivery = delivery.plus({ days: 1 });
            if (delivery.weekday !== 7) {
              added++;
            }
          }

          return corsResponse({
            despatchDateISO: cursor.toISODate(),
            despatchDateText: cursor.toFormat("d LLLL yyyy"),
            deliveryDateISO: delivery.toISODate(),
            deliveryDateText: delivery.toFormat("d LLLL yyyy"),
            remaining: cap.totalCapacity - cap.usedCapacity,
          });
        }
      }

      // Move to next day if no capacity (still respecting ±60 days guard)
      cursor = cursor.plus({ days: 1 });
    }

    return corsResponse({ error: "No available despatch date" }, 404);

  } catch (error: any) {
    console.error("API ERROR:", error);
    return corsResponse(
      { error: "Internal server error", details: error.message },
      500
    );
  }
}

