var _a;
import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, UNSAFE_withComponentProps, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useActionData, Form, redirect, UNSAFE_withErrorBoundaryProps, useRouteError, useFetcher } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-react-router/adapters/node";
import { shopifyApp, AppDistribution, ApiVersion, LoginErrorType, boundary } from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { useAppBridge } from "@shopify/app-bridge-react";
const prisma = global.prismaGlobal || new PrismaClient({
  log: ["query", "info", "warn", "error"]
  // optional, helpful for debugging
});
if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
ApiVersion.October25;
const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, reactRouterContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: reactRouterContext,
          url: request.url
        }
      ),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width,initial-scale=1"
      }), /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://cdn.shopify.com/"
      }), /* @__PURE__ */ jsx("link", {
        rel: "stylesheet",
        href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
      }), /* @__PURE__ */ jsx("link", {
        rel: "stylesheet",
        href: "index.css"
      }), /* @__PURE__ */ jsx("link", {
        rel: "stylesheet",
        href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const action$6 = async ({
  request
}) => {
  const {
    payload,
    session,
    topic,
    shop
  } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;
  if (session) {
    await prisma.session.update({
      where: {
        id: session.id
      },
      data: {
        scope: current.toString()
      }
    });
  }
  return new Response();
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6
}, Symbol.toStringTag, { value: "Module" }));
const action$5 = async ({
  request
}) => {
  const {
    shop,
    session,
    topic
  } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  if (session) {
    await prisma.session.deleteMany({
      where: {
        shop
      }
    });
  }
  return new Response();
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5
}, Symbol.toStringTag, { value: "Module" }));
async function getLeadTimes(settings, country = "GB") {
  const co = (settings == null ? void 0 : settings.countryOverrides) ?? {};
  const override = co[country] ?? {};
  return {
    despatchLead: override.despatchLead ?? (settings == null ? void 0 : settings.defaultDespatchLead) ?? 1,
    deliveryLead: override.deliveryLead ?? (settings == null ? void 0 : settings.defaultDeliveryLead) ?? 2,
    timezone: (settings == null ? void 0 : settings.timezone) ?? "Europe/London"
  };
}
async function findAndAllocateNextAvailable({
  shop,
  country = "GB",
  usedIncrease = 1,
  orderId
}) {
  const settings = await prisma.storeSettings.findFirst({
    where: { shop }
    // shopValue must be string
  });
  const { despatchLead, deliveryLead, timezone } = await getLeadTimes(
    settings,
    country
  );
  let cursor = DateTime.now().setZone(timezone).startOf("day");
  const maxDays = 90;
  for (let i = 0; i < maxDays; i++) {
    if (cursor.weekday >= 1 && cursor.weekday <= 5) {
      const dateUtc = cursor.toUTC().toJSDate();
      const result = await prisma.$transaction(async (tx) => {
        const cap = await tx.capacity.findUnique({ where: { date: dateUtc } });
        if (!cap || cap.closed) return null;
        if (cap.usedCapacity + usedIncrease > cap.totalCapacity) return null;
        const updatedCap = await tx.capacity.update({
          where: { id: cap.id },
          data: { usedCapacity: cap.usedCapacity + usedIncrease }
        });
        const alloc = await tx.allocation.create({
          data: {
            orderId: orderId ?? "",
            capacityId: cap.id,
            despatchDate: dateUtc
          }
        });
        return { updatedCap, allocId: alloc.id, capId: cap.id };
      });
      if (result) {
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
          capacityId: result.capId
        };
      }
    }
    cursor = cursor.plus({ days: 1 });
  }
  return null;
}
function makeAdminClient(shop, accessToken) {
  const base = `https://${shop}/admin/api/2025-07/graphql.json`;
  return {
    async graphql(query, variables) {
      const res = await fetch(base, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken
        },
        body: JSON.stringify({ query, variables })
      });
      return res.json();
    }
  };
}
const action$4 = async ({
  request
}) => {
  var _a2;
  const body = await request.json();
  const shop = request.headers.get("x-shopify-shop-domain") ?? void 0;
  const orderId = String(body == null ? void 0 : body.id);
  const country = ((_a2 = body == null ? void 0 : body.shipping_address) == null ? void 0 : _a2.country_code) ?? "GB";
  const settings = await prisma.storeSettings.findFirst({
    where: {
      shop
    }
  });
  const accessToken = settings == null ? void 0 : settings.accessToken;
  const allocation = await findAndAllocateNextAvailable({
    shop,
    country,
    usedIncrease: 1,
    orderId
  });
  if (!allocation) {
    return Response.json({
      ok: false,
      message: "No slot available"
    }, {
      status: 200
    });
  }
  if (accessToken) {
    const admin = makeAdminClient(shop, accessToken);
    const orderGid = `gid://shopify/Order/${orderId}`;
    const tags = [`Advertised Delivery Date ${allocation.deliveryDateISO}`, `Print Date ${allocation.despatchDateISO}`];
    await admin.graphql(`mutation tagsAdd($id: ID!, $tags: [String!]!) {
         tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
       }`, {
      id: orderGid,
      tags
    });
    await admin.graphql(`mutation metafieldsSet($ownerId: ID!, $metafields: [MetafieldsSetInput!]!) {
         metafieldsSet(ownerId: $ownerId, metafields: $metafields) {
           metafields { id key value }
           userErrors { field message }
         }
       }`, {
      ownerId: orderGid,
      metafields: [{
        namespace: "chuug",
        key: "estimated_delivery_date_iso",
        type: "single_line_text_field",
        value: allocation.deliveryDateISO
      }, {
        namespace: "chuug",
        key: "despatch_date_iso",
        type: "single_line_text_field",
        value: allocation.despatchDateISO
      }]
    });
  } else {
    console.warn("No access token: cannot write tags/metafields");
  }
  return Response.json({
    ok: true,
    allocation
  });
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4
}, Symbol.toStringTag, { value: "Module" }));
function corsResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
async function loader$9({
  request
}) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  try {
    const url = new URL(request.url);
    const country = url.searchParams.get("country") ?? "GB";
    const settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      return corsResponse({
        error: "Store settings not found"
      }, 500);
    }
    const tz = settings.timezone ?? "Europe/London";
    const {
      despatchLead,
      deliveryLead
    } = await getLeadTimes(settings, country);
    let cursor = DateTime.now().setZone(tz).startOf("day");
    for (let i = 0; i < 60; i++) {
      if (cursor.weekday >= 1 && cursor.weekday <= 5) {
        const dateUtc = cursor.toUTC().toJSDate();
        const cap = await prisma.capacity.findUnique({
          where: {
            date: dateUtc
          }
        });
        if (cap && !cap.closed && cap.usedCapacity < cap.totalCapacity) {
          let delivery = cursor;
          let added = 0;
          while (added < deliveryLead) {
            delivery = delivery.plus({
              days: 1
            });
            if (delivery.weekday !== 7) added++;
          }
          return corsResponse({
            despatchDateISO: cursor.toISODate(),
            despatchDateText: cursor.toFormat("d LLLL yyyy"),
            deliveryDateISO: delivery.toISODate(),
            deliveryDateText: delivery.toFormat("d LLLL yyyy"),
            remaining: cap.totalCapacity - cap.usedCapacity
          });
        }
      }
      cursor = cursor.plus({
        days: 1
      });
    }
    return corsResponse({
      error: "No available despatch date"
    }, 404);
  } catch (error) {
    console.error("API ERROR:", error);
    return corsResponse({
      error: "Internal server error",
      details: error.message
    }, 500);
  }
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
async function loader$8({
  request
}) {
  const capacities = await prisma.capacity.findMany();
  return Response.json(capacities);
}
async function action$3({
  request
}) {
  const method = request.method;
  if (method === "PUT") {
    const body = await request.json();
    if (body.usedIncrease) {
      const usedIncrease = parseInt(body.usedIncrease);
      const today2 = /* @__PURE__ */ new Date();
      today2.setHours(0, 0, 0, 0);
      const nextDay = await prisma.capacity.findFirst({
        where: {
          date: {
            gte: today2
          },
          // 👈 ONLY future or today
          usedCapacity: {
            lt: prisma.capacity.fields.totalCapacity
          }
          // space available
        },
        orderBy: {
          date: "asc"
        }
      });
      if (!nextDay) {
        return Response.json({
          message: "❌ No available dispatch day"
        }, {
          status: 400
        });
      }
      await prisma.capacity.update({
        where: {
          id: nextDay.id
        },
        data: {
          usedCapacity: nextDay.usedCapacity + usedIncrease
        }
      });
      return Response.json({
        message: "Order filled",
        updatedDate: nextDay.date
      });
    }
    const {
      totalCapacity: totalCapacity2,
      fromDate,
      toDate
    } = body;
    if (!totalCapacity2) {
      return Response.json({
        message: "❌ totalCapacity is required"
      }, {
        status: 400
      });
    }
    const startDate = fromDate ? new Date(fromDate) : /* @__PURE__ */ new Date();
    const endDate = toDate ? new Date(toDate) : null;
    startDate.setUTCHours(0, 0, 0, 0);
    if (endDate) endDate.setUTCHours(23, 59, 59, 999);
    let whereClause;
    if (endDate) {
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate
        }
      };
    } else if (fromDate) {
      whereClause = {
        date: startDate
      };
    } else {
      whereClause = {
        date: {
          gte: startDate
        }
      };
    }
    const existingCaps = await prisma.capacity.findMany({
      where: whereClause,
      orderBy: {
        date: "asc"
      }
    });
    let updatedCount = 0;
    let createdCount = 0;
    let loopEnd = endDate ? new Date(endDate) : new Date(startDate);
    if (!endDate && !fromDate) loopEnd.setDate(startDate.getDate() + 30);
    for (let d = new Date(startDate); d <= loopEnd; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      const isoDate = d.toISOString().split("T")[0];
      const existing = existingCaps.find((c) => new Date(c.date).toISOString().split("T")[0] === isoDate);
      if (existing) {
        await prisma.capacity.update({
          where: {
            id: existing.id
          },
          data: {
            totalCapacity: parseInt(totalCapacity2)
          }
        });
        updatedCount++;
      } else {
        await prisma.capacity.create({
          data: {
            date: new Date(d),
            totalCapacity: parseInt(totalCapacity2),
            usedCapacity: 0
          }
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
      createdCount
    });
  }
  const {
    totalCapacity,
    days = 30
  } = await request.json();
  const today = /* @__PURE__ */ new Date();
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
      where: {
        date: dateOnly
      }
    });
    if (!existing) {
      const newCap = await prisma.capacity.create({
        data: {
          date: dateOnly,
          totalCapacity: parseInt(totalCapacity),
          usedCapacity: 0
        }
      });
      capacities.push(newCap);
    }
    createdDays++;
  }
  return Response.json({
    message: `Capacity initialized for next ${days} working days.`,
    created: capacities.length
  });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
async function loader$7({
  request
}) {
  const settings = await prisma.storeSettings.findFirst();
  return Response.json(settings ?? {});
}
async function action$2({
  request
}) {
  const body = await request.json();
  const {
    timezone,
    defaultDespatchLead,
    defaultDeliveryLead,
    countryOverrides
  } = body;
  if (!timezone || defaultDespatchLead === void 0 || defaultDeliveryLead === void 0) {
    return Response.json({
      ok: false,
      error: "Missing required fields"
    }, {
      status: 400
    });
  }
  const existing = await prisma.storeSettings.findFirst();
  if (existing) {
    const updated = await prisma.storeSettings.update({
      where: {
        id: existing.id
      },
      data: {
        timezone,
        defaultDespatchLead,
        defaultDeliveryLead,
        countryOverrides
      }
    });
    return Response.json({
      ok: true,
      updated
    });
  } else {
    const created = await prisma.storeSettings.create({
      data: {
        timezone,
        defaultDespatchLead,
        defaultDeliveryLead,
        countryOverrides
      }
    });
    return Response.json({
      ok: true,
      created
    });
  }
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
const loader$6 = async ({
  request
}) => {
  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  let whereClause = {};
  if (startDate && endDate) {
    whereClause.date = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  } else if (startDate) {
    const d = new Date(startDate);
    d.setUTCHours(0, 0, 0, 0);
    whereClause.date = d;
  }
  const capacities = await prisma.capacity.findMany({
    where: whereClause,
    orderBy: {
      date: "asc"
    }
  });
  const report = capacities.map((c) => ({
    date: c.date,
    used: c.usedCapacity,
    total: c.totalCapacity
  }));
  return Response.json({
    success: true,
    report
  });
};
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
function loginErrorMessage(loginErrors) {
  if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }
  return {};
}
const loader$5 = async ({
  request
}) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
const action$1 = async ({
  request
}) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
const route$1 = UNSAFE_withComponentProps(function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const {
    errors
  } = actionData || loaderData;
  return /* @__PURE__ */ jsx(AppProvider, {
    embedded: false,
    children: /* @__PURE__ */ jsx("s-page", {
      children: /* @__PURE__ */ jsx(Form, {
        method: "post",
        children: /* @__PURE__ */ jsxs("s-section", {
          heading: "Log in",
          children: [/* @__PURE__ */ jsx("s-text-field", {
            name: "shop",
            label: "Shop domain",
            details: "example.myshopify.com",
            value: shop,
            onChange: (e) => setShop(e.currentTarget.value),
            autocomplete: "on",
            error: errors.shop
          }), /* @__PURE__ */ jsx("s-button", {
            type: "submit",
            children: "Log in"
          })]
        })
      })
    })
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: route$1,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const headers$2 = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  headers: headers$2,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const index = "_index_nc941_3";
const heading = "_heading_nc941_23";
const text = "_text_nc941_25";
const content = "_content_nc941_45";
const form = "_form_nc941_55";
const label = "_label_nc941_71";
const input = "_input_nc941_87";
const button = "_button_nc941_95";
const list = "_list_nc941_103";
const styles = {
  index,
  heading,
  text,
  content,
  form,
  label,
  input,
  button,
  list
};
const loader$3 = async ({
  request
}) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return {
    showForm: Boolean(login)
  };
};
const route = UNSAFE_withComponentProps(function App2() {
  const {
    showForm
  } = useLoaderData();
  return /* @__PURE__ */ jsx("div", {
    className: styles.index,
    children: /* @__PURE__ */ jsxs("div", {
      className: styles.content,
      children: [/* @__PURE__ */ jsx("h1", {
        className: styles.heading,
        children: "A short heading about [your app]"
      }), /* @__PURE__ */ jsx("p", {
        className: styles.text,
        children: "A tagline about [your app] that describes your value proposition."
      }), showForm && /* @__PURE__ */ jsxs(Form, {
        className: styles.form,
        method: "post",
        action: "/auth/login",
        children: [/* @__PURE__ */ jsxs("label", {
          className: styles.label,
          children: [/* @__PURE__ */ jsx("span", {
            children: "Shop domain"
          }), /* @__PURE__ */ jsx("input", {
            className: styles.input,
            type: "text",
            name: "shop"
          }), /* @__PURE__ */ jsx("span", {
            children: "e.g: my-shop-domain.myshopify.com"
          })]
        }), /* @__PURE__ */ jsx("button", {
          className: styles.button,
          type: "submit",
          children: "Log in"
        })]
      }), /* @__PURE__ */ jsxs("ul", {
        className: styles.list,
        children: [/* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        }), /* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        }), /* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        })]
      })]
    })
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({
  request
}) => {
  await authenticate.admin(request);
  return {
    apiKey: process.env.SHOPIFY_API_KEY || ""
  };
};
const app = UNSAFE_withComponentProps(function App3() {
  const {
    apiKey
  } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider, {
    embedded: true,
    apiKey,
    children: [/* @__PURE__ */ jsxs("s-app-nav", {
      children: [/* @__PURE__ */ jsx("s-link", {
        href: "/app",
        children: "Home"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/dashboard",
        children: "Dashboard"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/manageCapacity",
        children: "Manage Capacity"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/capacityReport",
        children: "Capacity Report"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/manageSettings",
        children: "Manage Settings"
      })]
    }), /* @__PURE__ */ jsx(Outlet, {})]
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2() {
  return boundary.error(useRouteError());
});
const headers$1 = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: app,
  headers: headers$1,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const CapacityReportTable = () => {
  const backend = "/api/report";
  const [report, setReport] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const {
        data
      } = await axios.get(backend, {
        params
      });
      const formattedReport = (data.report || []).map((item) => ({
        ...item,
        totalCapacity: item.total,
        usedCapacity: item.used,
        remainingCapacity: item.total - item.used
      }));
      setReport(formattedReport);
      const totalDays = formattedReport.length;
      const totalCapacity = formattedReport.reduce((acc, cur) => acc + cur.totalCapacity, 0);
      const usedCapacity = formattedReport.reduce((acc, cur) => acc + cur.usedCapacity, 0);
      const remainingCapacity = totalCapacity - usedCapacity;
      setSummary({
        totalDays,
        totalCapacity,
        usedCapacity,
        remainingCapacity
      });
    } catch (err) {
      console.error("Error fetching capacity report:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReport();
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    className: "p-6 bg-gray-50 min-h-screen",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "text-2xl font-bold text-gray-800 mb-6",
      children: "Capacity Report"
    }), /* @__PURE__ */ jsxs("div", {
      className: "mb-6 flex flex-wrap items-center gap-4",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-sm font-medium text-gray-700",
          children: "Start Date"
        }), /* @__PURE__ */ jsx("input", {
          type: "date",
          value: startDate,
          onChange: (e) => setStartDate(e.target.value),
          className: "rounded-md border px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-sm font-medium text-gray-700",
          children: "End Date"
        }), /* @__PURE__ */ jsx("input", {
          type: "date",
          value: endDate,
          onChange: (e) => setEndDate(e.target.value),
          className: "rounded-md border px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500"
        })]
      }), /* @__PURE__ */ jsx("button", {
        onClick: fetchReport,
        className: "mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700",
        children: "Apply Filter"
      })]
    }), summary && /* @__PURE__ */ jsxs("div", {
      className: "mb-6 rounded-lg border bg-gray-50 p-4 shadow-sm",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "mb-2 text-lg font-semibold text-gray-700",
        children: "Summary"
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-2 gap-4 md:grid-cols-4",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm text-gray-600",
            children: "Total Days"
          }), /* @__PURE__ */ jsx("p", {
            className: "font-semibold",
            children: summary.totalDays
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm text-gray-600",
            children: "Total Capacity"
          }), /* @__PURE__ */ jsx("p", {
            className: "font-semibold",
            children: summary.totalCapacity
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm text-gray-600",
            children: "Used Capacity"
          }), /* @__PURE__ */ jsx("p", {
            className: "font-semibold text-blue-600",
            children: summary.usedCapacity
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm text-gray-600",
            children: "Remaining Capacity"
          }), /* @__PURE__ */ jsx("p", {
            className: "font-semibold text-green-600",
            children: summary.remainingCapacity
          })]
        })]
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "overflow-x-auto rounded-lg border shadow-sm bg-white",
      children: /* @__PURE__ */ jsxs("table", {
        className: "min-w-full divide-y divide-gray-200",
        children: [/* @__PURE__ */ jsx("thead", {
          className: "bg-gray-100",
          children: /* @__PURE__ */ jsxs("tr", {
            children: [/* @__PURE__ */ jsx("th", {
              className: "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600",
              children: "Date"
            }), /* @__PURE__ */ jsx("th", {
              className: "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600",
              children: "Total Capacity"
            }), /* @__PURE__ */ jsx("th", {
              className: "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600",
              children: "Used Capacity"
            }), /* @__PURE__ */ jsx("th", {
              className: "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600",
              children: "Remaining"
            })]
          })
        }), /* @__PURE__ */ jsx("tbody", {
          className: "divide-y divide-gray-100",
          children: loading ? /* @__PURE__ */ jsx("tr", {
            children: /* @__PURE__ */ jsx("td", {
              colSpan: 4,
              className: "px-6 py-4 text-center text-gray-500",
              children: "Loading..."
            })
          }) : report.length > 0 ? report.map((item, i) => /* @__PURE__ */ jsxs("tr", {
            className: "hover:bg-gray-50",
            children: [/* @__PURE__ */ jsx("td", {
              className: "px-6 py-4 text-sm text-gray-800",
              children: item.date.split("T")[0]
            }), /* @__PURE__ */ jsx("td", {
              className: "px-6 py-4 text-sm text-gray-800",
              children: item.totalCapacity
            }), /* @__PURE__ */ jsx("td", {
              className: "px-6 py-4 text-sm text-blue-600 font-medium",
              children: item.usedCapacity
            }), /* @__PURE__ */ jsx("td", {
              className: "px-6 py-4 text-sm text-green-600 font-medium",
              children: item.remainingCapacity
            })]
          }, i)) : /* @__PURE__ */ jsx("tr", {
            children: /* @__PURE__ */ jsx("td", {
              colSpan: 4,
              className: "px-6 py-4 text-center text-gray-500 italic",
              children: "No records found."
            })
          })
        })]
      })
    })]
  });
};
const app_capacityReport = UNSAFE_withComponentProps(CapacityReportTable);
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_capacityReport
}, Symbol.toStringTag, { value: "Module" }));
const ManageCapacity = () => {
  const backend = "/api/capacity";
  const [createCapacity, setCreateCapacity] = useState(100);
  const [createDays, setCreateDays] = useState(30);
  const [updateCapacity, setUpdateCapacity] = useState(100);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [usedIncrease, setUsedIncrease] = useState(1);
  const [message, setMessage] = useState("");
  const handleCreateCapacity = async () => {
    var _a2, _b;
    setMessage("Creating capacity...");
    try {
      const res = await axios.post(`${backend}`, {
        totalCapacity: createCapacity,
        days: createDays
      });
      setMessage(`✅ ${res.data.message}`);
    } catch (error) {
      console.error("Error creating capacity:", error);
      setMessage(`❌ ${((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.error) || "Failed to create capacity"}`);
    }
  };
  const handleUpdateCapacity = async () => {
    var _a2, _b;
    setMessage("Updating total capacity...");
    try {
      const payload = {
        totalCapacity: updateCapacity
      };
      if (fromDate && toDate) {
        payload.fromDate = fromDate;
        payload.toDate = toDate;
      } else if (fromDate && !toDate) {
        payload.fromDate = fromDate;
      }
      const res = await axios.put(`${backend}`, payload);
      setMessage(`✅ ${res.data.message}`);
    } catch (error) {
      console.error("Error updating capacity:", error);
      setMessage(`❌ ${((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.error) || "Failed to update capacity"}`);
    }
  };
  const handleFillOrders = async () => {
    var _a2, _b;
    setMessage("Filling orders...");
    try {
      const res = await axios.put(`${backend}`, {
        usedIncrease
      });
      setMessage(`✅ Order filled for ${res.data.updatedDate}`);
    } catch (error) {
      console.error("Error filling orders:", error);
      setMessage(`❌ ${((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.message) || "No available dispatch day"}`);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "p-6 bg-gray-50 min-h-screen",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "text-2xl font-bold mb-6 text-gray-800",
      children: "Manage Capacity"
    }), message && /* @__PURE__ */ jsx("div", {
      className: `mb-4 p-3 rounded-xl text-white ${message.startsWith("✅") ? "bg-green-600" : message.startsWith("❌") ? "bg-red-600" : "bg-blue-600"}`,
      children: message
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-4 bg-white shadow rounded-2xl mb-6",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "font-semibold mb-4 text-gray-700",
        children: "Create New Capacity"
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col sm:flex-row gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex flex-col w-full sm:w-1/3",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-sm text-gray-600 mb-1",
            children: "Total Capacity"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            className: "border p-2 rounded-md",
            value: createCapacity,
            onChange: (e) => setCreateCapacity(Number(e.target.value))
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col w-full sm:w-1/3",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-sm text-gray-600 mb-1",
            children: "Days (default 30)"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            className: "border p-2 rounded-md",
            value: createDays,
            onChange: (e) => setCreateDays(Number(e.target.value))
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "flex items-end",
          children: /* @__PURE__ */ jsx("button", {
            onClick: handleCreateCapacity,
            className: "bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600",
            children: "Create"
          })
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-4 bg-white shadow rounded-2xl mb-6",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "font-semibold mb-4 text-gray-700",
        children: "Update Total Capacity"
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 sm:grid-cols-5 gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex flex-col",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-sm text-gray-600 mb-1",
            children: "New Total Capacity"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            className: "border p-2 rounded-md",
            value: updateCapacity,
            onChange: (e) => setUpdateCapacity(Number(e.target.value))
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-sm text-gray-600 mb-1",
            children: "From Date"
          }), /* @__PURE__ */ jsx("input", {
            type: "date",
            className: "border p-2 rounded-md",
            value: fromDate,
            onChange: (e) => setFromDate(e.target.value)
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-sm text-gray-600 mb-1",
            children: "To Date (optional)"
          }), /* @__PURE__ */ jsx("input", {
            type: "date",
            className: "border p-2 rounded-md",
            value: toDate,
            onChange: (e) => setToDate(e.target.value)
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "flex items-end",
          children: /* @__PURE__ */ jsx("button", {
            onClick: handleUpdateCapacity,
            className: "bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full",
            children: "Update"
          })
        })]
      }), /* @__PURE__ */ jsxs("p", {
        className: "text-sm text-gray-500 mt-3",
        children: [/* @__PURE__ */ jsx("b", {
          children: "Tips:"
        }), /* @__PURE__ */ jsx("br", {}), "– Leave both dates empty → updates all future working days.", /* @__PURE__ */ jsx("br", {}), "– Provide only ", /* @__PURE__ */ jsx("b", {
          children: "From Date"
        }), " → updates that single date.", /* @__PURE__ */ jsx("br", {}), "– Provide both → updates a range of dates."]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-4 bg-white shadow rounded-2xl",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "font-semibold mb-4 text-gray-700",
        children: "Fill Orders"
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col sm:flex-row gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex flex-col w-full sm:w-1/3",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-sm text-gray-600 mb-1",
            children: "Orders to Fill (default 1)"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            className: "border p-2 rounded-md",
            value: usedIncrease,
            onChange: (e) => setUsedIncrease(Number(e.target.value))
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "flex items-end",
          children: /* @__PURE__ */ jsx("button", {
            onClick: handleFillOrders,
            className: "bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600",
            children: "Fill Orders"
          })
        })]
      })]
    })]
  });
};
const app_manageCapacity = UNSAFE_withComponentProps(ManageCapacity);
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_manageCapacity
}, Symbol.toStringTag, { value: "Module" }));
const app_manageSettings = UNSAFE_withComponentProps(function ManageSettings() {
  const [timezone, setTimezone] = useState("Europe/London");
  const [despatchLead, setDespatchLead] = useState(1);
  const [deliveryLead, setDeliveryLead] = useState(2);
  const [countryOverrides, setCountryOverrides] = useState({});
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      if (data) {
        setTimezone(data.timezone ?? "Europe/London");
        setDespatchLead(data.defaultDespatchLead ?? 1);
        setDeliveryLead(data.defaultDeliveryLead ?? 2);
        setCountryOverrides(data.countryOverrides ?? {});
      }
    });
  }, []);
  const save = async () => {
    setMsg("Saving...");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        timezone,
        defaultDespatchLead: despatchLead,
        defaultDeliveryLead: deliveryLead,
        countryOverrides
      })
    });
    const j = await res.json();
    setMsg(j.ok ? "✅ Saved successfully" : "❌ Error saving settings");
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "p-6 bg-gray-50 min-h-screen",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "text-2xl font-bold mb-6 text-gray-800",
      children: "Manage Store Settings"
    }), msg && /* @__PURE__ */ jsx("div", {
      className: `mb-4 p-3 rounded-xl text-white ${msg.startsWith("✅") ? "bg-green-600" : msg.startsWith("❌") ? "bg-red-600" : "bg-blue-600"}`,
      children: msg
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-4 bg-white shadow rounded-2xl mb-6",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "font-semibold mb-4 text-gray-700",
        children: "General Settings"
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex flex-col",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-sm text-gray-600 mb-1",
            children: "Timezone"
          }), /* @__PURE__ */ jsx("input", {
            className: "border p-2 rounded-md",
            value: timezone,
            onChange: (e) => setTimezone(e.target.value)
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-sm text-gray-600 mb-1",
            children: "Default Despatch Lead (days)"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            className: "border p-2 rounded-md",
            value: despatchLead,
            onChange: (e) => setDespatchLead(Number(e.target.value))
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-sm text-gray-600 mb-1",
            children: "Default Delivery Lead (days)"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            className: "border p-2 rounded-md",
            value: deliveryLead,
            onChange: (e) => setDeliveryLead(Number(e.target.value))
          })]
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "p-4 bg-white shadow rounded-2xl mb-6",
      children: [/* @__PURE__ */ jsx("h3", {
        className: "font-semibold mb-4 text-gray-700",
        children: "Country Overrides"
      }), Object.entries(countryOverrides).map(([country, leads]) => /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-4 gap-2 items-end mb-3",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex flex-col",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-xs text-gray-500 mb-1",
            children: "Country"
          }), /* @__PURE__ */ jsx("input", {
            className: "border p-2 rounded-md w-full text-center",
            value: country,
            onChange: (e) => {
              const newOverrides = {
                ...countryOverrides
              };
              newOverrides[e.target.value] = leads;
              if (e.target.value !== country) delete newOverrides[country];
              setCountryOverrides(newOverrides);
            },
            placeholder: "Country code"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-xs text-gray-500 mb-1",
            children: "Despatch Lead (days)"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            className: "border p-2 rounded-md w-full",
            value: leads.despatchLead,
            onChange: (e) => {
              const newOverrides = {
                ...countryOverrides
              };
              newOverrides[country] = {
                ...leads,
                despatchLead: Number(e.target.value)
              };
              setCountryOverrides(newOverrides);
            }
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col",
          children: [/* @__PURE__ */ jsx("label", {
            className: "text-xs text-gray-500 mb-1",
            children: "Delivery Lead (days)"
          }), /* @__PURE__ */ jsx("input", {
            type: "number",
            className: "border p-2 rounded-md w-full",
            value: leads.deliveryLead,
            onChange: (e) => {
              const newOverrides = {
                ...countryOverrides
              };
              newOverrides[country] = {
                ...leads,
                deliveryLead: Number(e.target.value)
              };
              setCountryOverrides(newOverrides);
            }
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "flex flex-col",
          children: /* @__PURE__ */ jsx("button", {
            className: "bg-red-500 text-white px-2 py-1 rounded mt-5",
            onClick: () => {
              const newOverrides = {
                ...countryOverrides
              };
              delete newOverrides[country];
              setCountryOverrides(newOverrides);
            },
            children: "Remove"
          })
        })]
      }, country)), /* @__PURE__ */ jsx("button", {
        className: "mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
        onClick: () => {
          const newOverrides = {
            ...countryOverrides
          };
          let newKey = "NEW";
          let counter = 1;
          while (newOverrides[newKey]) {
            newKey = `NEW${counter++}`;
          }
          newOverrides[newKey] = {
            despatchLead: 1,
            deliveryLead: 1
          };
          setCountryOverrides(newOverrides);
        },
        children: "Add Country"
      })]
    }), /* @__PURE__ */ jsx("button", {
      onClick: save,
      className: "bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 shadow",
      children: "Save Settings"
    })]
  });
});
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_manageSettings
}, Symbol.toStringTag, { value: "Module" }));
const app_additional = UNSAFE_withComponentProps(function AdditionalPage() {
  return /* @__PURE__ */ jsxs("s-page", {
    heading: "Additional page",
    children: [/* @__PURE__ */ jsxs("s-section", {
      heading: "Multiple pages",
      children: [/* @__PURE__ */ jsxs("s-paragraph", {
        children: ["The app template comes with an additional page which demonstrates how to create multiple pages within app navigation using", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/apps/tools/app-bridge",
          target: "_blank",
          children: "App Bridge"
        }), "."]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: ["To create your own page and have it show up in the app navigation, add a page inside ", /* @__PURE__ */ jsx("code", {
          children: "app/routes"
        }), ", and a link to it in the", " ", /* @__PURE__ */ jsx("code", {
          children: "<ui-nav-menu>"
        }), " component found in", " ", /* @__PURE__ */ jsx("code", {
          children: "app/routes/app.jsx"
        }), "."]
      })]
    }), /* @__PURE__ */ jsx("s-section", {
      slot: "aside",
      heading: "Resources",
      children: /* @__PURE__ */ jsx("s-unordered-list", {
        children: /* @__PURE__ */ jsx("s-list-item", {
          children: /* @__PURE__ */ jsx("s-link", {
            href: "https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav",
            target: "_blank",
            children: "App nav best practices"
          })
        })
      })
    })]
  });
});
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_additional
}, Symbol.toStringTag, { value: "Module" }));
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const loader$1 = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const app_dashboard = UNSAFE_withComponentProps(function DashboardPage() {
  const backend = "/api/report";
  useAppBridge();
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;
      const res = await axios.get(backend, {
        params
      });
      const mappedData = (res.data.report || []).map((item) => ({
        date: item.date,
        totalCapacity: item.total,
        // map 'total' to 'totalCapacity'
        usedCapacity: item.used
        // map 'used' to 'usedCapacity'
      }));
      setData(mappedData);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReport();
  }, []);
  const totalCapacities = data.reduce((sum, d) => sum + d.totalCapacity, 0);
  const usedCapacities = data.reduce((sum, d) => sum + d.usedCapacity, 0);
  const remainingCapacities = totalCapacities - usedCapacities;
  const chartData = {
    labels: data.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    }),
    datasets: [{
      label: "Total Capacity",
      data: data.map((d) => d.totalCapacity),
      borderColor: "rgba(59,130,246,1)",
      backgroundColor: "rgba(59,130,246,0.2)",
      tension: 0.3,
      fill: true
    }, {
      label: "Used Capacity",
      data: data.map((d) => d.usedCapacity),
      borderColor: "rgba(239,68,68,1)",
      backgroundColor: "rgba(239,68,68,0.2)",
      tension: 0.3,
      fill: true
    }]
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // This is crucial!
    plugins: {
      legend: {
        position: "top",
        display: true
      },
      title: {
        display: true,
        text: "Capacity Overview"
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date"
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Capacity"
        },
        beginAtZero: true
      }
    }
  };
  return /* @__PURE__ */ jsx("s-page", {
    heading: "Dashboard",
    children: /* @__PURE__ */ jsx("s-section", {
      heading: "Capacity Overview",
      children: /* @__PURE__ */ jsxs("s-box", {
        padding: "base",
        background: "subdued",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex gap-3 mb-4",
          children: [/* @__PURE__ */ jsx("input", {
            type: "date",
            value: fromDate,
            onChange: (e) => setFromDate(e.target.value),
            className: "border p-2 rounded-md"
          }), /* @__PURE__ */ jsx("input", {
            type: "date",
            value: toDate,
            onChange: (e) => setToDate(e.target.value),
            className: "border p-2 rounded-md"
          }), /* @__PURE__ */ jsx("s-button", {
            onClick: fetchReport,
            children: "Apply Filter"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-3 gap-3 mb-6",
          children: [/* @__PURE__ */ jsxs("s-card", {
            children: [/* @__PURE__ */ jsx("s-text", {
              children: "Total"
            }), /* @__PURE__ */ jsx("s-text", {
              children: totalCapacities
            })]
          }), /* @__PURE__ */ jsxs("s-card", {
            children: [/* @__PURE__ */ jsx("s-text", {
              children: "Used"
            }), /* @__PURE__ */ jsx("s-text", {
              children: usedCapacities
            })]
          }), /* @__PURE__ */ jsxs("s-card", {
            children: [/* @__PURE__ */ jsx("s-text", {
              children: "Remaining"
            }), /* @__PURE__ */ jsx("s-text", {
              children: remainingCapacities
            })]
          })]
        }), loading ? /* @__PURE__ */ jsx("s-text", {
          children: "Loading report..."
        }) : data.length > 0 ? /* @__PURE__ */ jsx("div", {
          style: {
            height: "400px",
            width: "100%"
          },
          children: /* @__PURE__ */ jsx(Line, {
            data: chartData,
            options: chartOptions
          })
        }) : /* @__PURE__ */ jsx("s-text", {
          children: "No data available for selected range."
        })]
      })
    })
  });
});
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_dashboard,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const action = async ({
  request
}) => {
  const {
    admin
  } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][Math.floor(Math.random() * 4)];
  const response = await admin.graphql(`#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`, {
    variables: {
      product: {
        title: `${color} Snowboard`
      }
    }
  });
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(`#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`, {
    variables: {
      productId: product.id,
      variants: [{
        id: variantId,
        price: "100.00"
      }]
    }
  });
  const variantResponseJson = await variantResponse.json();
  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants
  };
};
const app__index = UNSAFE_withComponentProps(function Index() {
  var _a2, _b, _c, _d;
  const fetcher = useFetcher();
  const shopify2 = useAppBridge();
  const isLoading = ["loading", "submitting"].includes(fetcher.state) && fetcher.formMethod === "POST";
  useEffect(() => {
    var _a3, _b2;
    if ((_b2 = (_a3 = fetcher.data) == null ? void 0 : _a3.product) == null ? void 0 : _b2.id) {
      shopify2.toast.show("Product created");
    }
  }, [(_b = (_a2 = fetcher.data) == null ? void 0 : _a2.product) == null ? void 0 : _b.id, shopify2]);
  const generateProduct = () => fetcher.submit({}, {
    method: "POST"
  });
  return /* @__PURE__ */ jsxs("s-page", {
    heading: "Shopify app template",
    children: [/* @__PURE__ */ jsx("s-button", {
      slot: "primary-action",
      onClick: generateProduct,
      children: "Generate a product"
    }), /* @__PURE__ */ jsx("s-section", {
      heading: "Congrats on creating a new Shopify app 🎉",
      children: /* @__PURE__ */ jsxs("s-paragraph", {
        children: ["This embedded app template uses", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/apps/tools/app-bridge",
          target: "_blank",
          children: "App Bridge"
        }), " ", "interface examples like an", " ", /* @__PURE__ */ jsx("s-link", {
          href: "/app/additional",
          children: "additional page in the app nav"
        }), ", as well as an", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/api/admin-graphql",
          target: "_blank",
          children: "Admin GraphQL"
        }), " ", "mutation demo, to provide a starting point for app development."]
      })
    }), /* @__PURE__ */ jsxs("s-section", {
      heading: "Get started with products",
      children: [/* @__PURE__ */ jsxs("s-paragraph", {
        children: ["Generate a product with GraphQL and get the JSON output for that product. Learn more about the", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate",
          target: "_blank",
          children: "productCreate"
        }), " ", "mutation in our API references."]
      }), /* @__PURE__ */ jsxs("s-stack", {
        direction: "inline",
        gap: "base",
        children: [/* @__PURE__ */ jsx("s-button", {
          onClick: generateProduct,
          ...isLoading ? {
            loading: true
          } : {},
          children: "Generate a product"
        }), ((_c = fetcher.data) == null ? void 0 : _c.product) && /* @__PURE__ */ jsx("s-button", {
          onClick: () => {
            var _a3, _b2, _c2, _d2;
            (_d2 = (_c2 = shopify2.intents).invoke) == null ? void 0 : _d2.call(_c2, "edit:shopify/Product", {
              value: (_b2 = (_a3 = fetcher.data) == null ? void 0 : _a3.product) == null ? void 0 : _b2.id
            });
          },
          target: "_blank",
          variant: "tertiary",
          children: "Edit product"
        })]
      }), ((_d = fetcher.data) == null ? void 0 : _d.product) && /* @__PURE__ */ jsx("s-section", {
        heading: "productCreate mutation",
        children: /* @__PURE__ */ jsxs("s-stack", {
          direction: "block",
          gap: "base",
          children: [/* @__PURE__ */ jsx("s-box", {
            padding: "base",
            borderWidth: "base",
            borderRadius: "base",
            background: "subdued",
            children: /* @__PURE__ */ jsx("pre", {
              style: {
                margin: 0
              },
              children: /* @__PURE__ */ jsx("code", {
                children: JSON.stringify(fetcher.data.product, null, 2)
              })
            })
          }), /* @__PURE__ */ jsx("s-heading", {
            children: "productVariantsBulkUpdate mutation"
          }), /* @__PURE__ */ jsx("s-box", {
            padding: "base",
            borderWidth: "base",
            borderRadius: "base",
            background: "subdued",
            children: /* @__PURE__ */ jsx("pre", {
              style: {
                margin: 0
              },
              children: /* @__PURE__ */ jsx("code", {
                children: JSON.stringify(fetcher.data.variant, null, 2)
              })
            })
          })]
        })
      })]
    }), /* @__PURE__ */ jsxs("s-section", {
      slot: "aside",
      heading: "App template specs",
      children: [/* @__PURE__ */ jsxs("s-paragraph", {
        children: [/* @__PURE__ */ jsx("s-text", {
          children: "Framework: "
        }), /* @__PURE__ */ jsx("s-link", {
          href: "https://reactrouter.com/",
          target: "_blank",
          children: "React Router"
        })]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: [/* @__PURE__ */ jsx("s-text", {
          children: "Interface: "
        }), /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/api/app-home/using-polaris-components",
          target: "_blank",
          children: "Polaris web components"
        })]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: [/* @__PURE__ */ jsx("s-text", {
          children: "API: "
        }), /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/api/admin-graphql",
          target: "_blank",
          children: "GraphQL"
        })]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: [/* @__PURE__ */ jsx("s-text", {
          children: "Database: "
        }), /* @__PURE__ */ jsx("s-link", {
          href: "https://www.prisma.io/",
          target: "_blank",
          children: "Prisma"
        })]
      })]
    }), /* @__PURE__ */ jsx("s-section", {
      slot: "aside",
      heading: "Next steps",
      children: /* @__PURE__ */ jsxs("s-unordered-list", {
        children: [/* @__PURE__ */ jsxs("s-list-item", {
          children: ["Build an", " ", /* @__PURE__ */ jsx("s-link", {
            href: "https://shopify.dev/docs/apps/getting-started/build-app-example",
            target: "_blank",
            children: "example app"
          })]
        }), /* @__PURE__ */ jsxs("s-list-item", {
          children: ["Explore Shopify's API with", " ", /* @__PURE__ */ jsx("s-link", {
            href: "https://shopify.dev/docs/apps/tools/graphiql-admin-api",
            target: "_blank",
            children: "GraphiQL"
          })]
        })]
      })
    })]
  });
});
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: app__index,
  headers,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BuRQXgqR.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-C0RYl5n-.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/webhooks.app.scopes_update": { "id": "routes/webhooks.app.scopes_update", "parentId": "root", "path": "webhooks/app/scopes_update", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.scopes_update-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/webhooks.app.uninstalled": { "id": "routes/webhooks.app.uninstalled", "parentId": "root", "path": "webhooks/app/uninstalled", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.uninstalled-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/webhooks.orders-create": { "id": "routes/webhooks.orders-create", "parentId": "root", "path": "webhooks/orders-create", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/webhooks.orders-create-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.next-despatch": { "id": "routes/api.next-despatch", "parentId": "root", "path": "api/next-despatch", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.next-despatch-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.capacity": { "id": "routes/api.capacity", "parentId": "root", "path": "api/capacity", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.capacity-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.settings": { "id": "routes/api.settings", "parentId": "root", "path": "api/settings", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.settings-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/api.report": { "id": "routes/api.report", "parentId": "root", "path": "api/report", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/api.report-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/route-CVRLSGsC.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js", "/assets/AppProxyProvider-D-bRRKe8.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/route-DmKyGOfS.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js"], "css": ["/assets/route-CkbrDFI1.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/app-e0-rWfK5.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js", "/assets/AppProxyProvider-D-bRRKe8.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.capacityReport": { "id": "routes/app.capacityReport", "parentId": "routes/app", "path": "capacityReport", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app.capacityReport-FyDLgEa6.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js", "/assets/index-B9ygI19o.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.manageCapacity": { "id": "routes/app.manageCapacity", "parentId": "routes/app", "path": "manageCapacity", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app.manageCapacity-DBiwlxBd.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js", "/assets/index-B9ygI19o.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.manageSettings": { "id": "routes/app.manageSettings", "parentId": "routes/app", "path": "manageSettings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app.manageSettings-BqSScVtF.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.additional": { "id": "routes/app.additional", "parentId": "routes/app", "path": "additional", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app.additional-CpmwjA68.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.dashboard": { "id": "routes/app.dashboard", "parentId": "routes/app", "path": "dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app.dashboard-BKvorWVi.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js", "/assets/index-B9ygI19o.js", "/assets/useAppBridge-Bj34gXAL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app._index-Dv4wO4ID.js", "imports": ["/assets/chunk-4WY6JWTD-BgPu_Zjs.js", "/assets/useAppBridge-Bj34gXAL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-7eba3bf1.js", "version": "7eba3bf1", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/webhooks.app.scopes_update": {
    id: "routes/webhooks.app.scopes_update",
    parentId: "root",
    path: "webhooks/app/scopes_update",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/webhooks.app.uninstalled": {
    id: "routes/webhooks.app.uninstalled",
    parentId: "root",
    path: "webhooks/app/uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/webhooks.orders-create": {
    id: "routes/webhooks.orders-create",
    parentId: "root",
    path: "webhooks/orders-create",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/api.next-despatch": {
    id: "routes/api.next-despatch",
    parentId: "root",
    path: "api/next-despatch",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/api.capacity": {
    id: "routes/api.capacity",
    parentId: "root",
    path: "api/capacity",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/api.settings": {
    id: "routes/api.settings",
    parentId: "root",
    path: "api/settings",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/api.report": {
    id: "routes/api.report",
    parentId: "root",
    path: "api/report",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route10
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/app.capacityReport": {
    id: "routes/app.capacityReport",
    parentId: "routes/app",
    path: "capacityReport",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/app.manageCapacity": {
    id: "routes/app.manageCapacity",
    parentId: "routes/app",
    path: "manageCapacity",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/app.manageSettings": {
    id: "routes/app.manageSettings",
    parentId: "routes/app",
    path: "manageSettings",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/app.additional": {
    id: "routes/app.additional",
    parentId: "routes/app",
    path: "additional",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/app.dashboard": {
    id: "routes/app.dashboard",
    parentId: "routes/app",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route17
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
