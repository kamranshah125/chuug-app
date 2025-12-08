// app/routes/api.settings.ts
import prisma from "app/db.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

// Get current store settings
export async function loader({ request }: LoaderFunctionArgs) {
  // Assume only one settings record
  const settings = await prisma.storeSettings.findFirst();
  return Response.json(settings ?? {});
}

// Save or update store settings
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { timezone, defaultDespatchLead, defaultDeliveryLead, countryOverrides,despatchCutoffTime} = body;

  // Validate input
  if (!timezone || defaultDespatchLead === undefined || defaultDeliveryLead === undefined) {
    return Response.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.storeSettings.findFirst();

  if (existing) {
    // Update existing settings
    const updated = await prisma.storeSettings.update({
      where: { id: existing.id },
      data: {
        timezone,
        defaultDespatchLead,
        defaultDeliveryLead,
        countryOverrides,
        despatchCutoffTime,
      },
    });
    return Response.json({ ok: true, updated });
  } else {
    // Create new settings
    const created = await prisma.storeSettings.create({
      data: {
        timezone,
        defaultDespatchLead,
        defaultDeliveryLead,
        countryOverrides,
        despatchCutoffTime,
      },
    });
    return Response.json({ ok: true, created });
  }
}
