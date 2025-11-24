// app/routes/webhooks.orders-create.ts
import prisma from "app/db.server";
import { findAndAllocateNextAvailable } from "app/services/allocationService";
import { makeAdminClient } from "app/utils/shopifyAdminClient";

export const action = async ({ request }: any) => {
  const body = await request.json();
  const shop = request.headers.get("x-shopify-shop-domain") ?? undefined;
  const orderId = String(body?.id);
  const country = body?.shipping_address?.country_code ?? "GB";

  // Find access token from DB
  const settings = await prisma.storeSettings.findUnique({ where: { shop } });
  const accessToken = settings?.accessToken;

  // allocate (attach orderId on creation)
  const allocation = await findAndAllocateNextAvailable({
    shop,
    country,
    usedIncrease: 1,
    orderId,
  });

  if (!allocation) {
    // fallback: no slot => ignore or add tag "No slot"
    return Response.json({ ok: false, message: "No slot available" }, { status: 200 });
  }

  // Update Shopify order tags + metafields using stored token
  if (accessToken) {
    const admin = makeAdminClient(shop!, accessToken);
    const orderGid = `gid://shopify/Order/${orderId}`;
    const tags = [
      `Advertised Delivery Date ${allocation.deliveryDateISO}`,
      `Print Date ${allocation.despatchDateISO}`,
    ];

    await admin.graphql(
      `mutation tagsAdd($id: ID!, $tags: [String!]!) {
         tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
       }`,
      { id: orderGid, tags }
    );

    await admin.graphql(
      `mutation metafieldsSet($ownerId: ID!, $metafields: [MetafieldsSetInput!]!) {
         metafieldsSet(ownerId: $ownerId, metafields: $metafields) {
           metafields { id key value }
           userErrors { field message }
         }
       }`,
      {
        ownerId: orderGid,
        metafields: [
          {
            namespace: "chuug",
            key: "estimated_delivery_date_iso",
            type: "single_line_text_field",
            value: allocation.deliveryDateISO,
          },
          {
            namespace: "chuug",
            key: "despatch_date_iso",
            type: "single_line_text_field",
            value: allocation.despatchDateISO,
          },
        ],
      }
    );
  } else {
    console.warn("No access token: cannot write tags/metafields");
  }

  return Response.json({ ok: true, allocation });
};
