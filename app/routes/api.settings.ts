// app/routes/api.settings.ts
import prisma from "app/db.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") ?? undefined;
  if (!shop) return Response.json({ error: "shop required" }, { status: 400 });
  const settings = await prisma.storeSettings.findUnique({ where: { shop } });
  return Response.json(settings ?? {});
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { shop, timezone, defaultDespatchLead, defaultDeliveryLead, countryOverrides } = body;
  if (!shop) return Response.json({ error: "shop required" }, { status: 400 });

  const existing = await prisma.storeSettings.findUnique({ where: { shop } });
  if (existing) {
    const updated = await prisma.storeSettings.update({
      where: { shop },
      data: {
        timezone,
        defaultDespatchLead,
        defaultDeliveryLead,
        countryOverrides,
      },
    });
    return Response.json({ ok: true, updated });
  } else {
    const created = await prisma.storeSettings.create({
      data: {
        shop,
        timezone,
        defaultDespatchLead,
        defaultDeliveryLead,
        countryOverrides,
      },
    });
    return Response.json({ ok: true, created });
  }
}
