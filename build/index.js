var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest,
  streamTimeout: () => streamTimeout
});
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";

// app/shopify.server.ts
import "@shopify/shopify-app-react-router/adapters/node";
import "dotenv/config";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";

// app/db.server.ts
import { PrismaClient } from "@prisma/client";
var prisma = global.prismaGlobal || new PrismaClient({
  log: ["query", "info", "warn", "error"]
  // optional, helpful for debugging
}), db_server_default = prisma;

// app/shopify.server.ts
var shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(db_server_default),
  distribution: AppDistribution.AppStore,
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
var apiVersion = ApiVersion.October25, addDocumentResponseHeaders = shopify.addDocumentResponseHeaders, authenticate = shopify.authenticate, unauthenticated = shopify.unauthenticated, login = shopify.login, registerWebhooks = shopify.registerWebhooks, sessionStorage = shopify.sessionStorage;

// app/entry.server.tsx
import { jsx } from "react/jsx-runtime";
var streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, reactRouterContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  let userAgent = request.headers.get("user-agent"), callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    let { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: reactRouterContext,
          url: request.url
        }
      ),
      {
        [callbackName]: () => {
          let body = new PassThrough(), stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App
});
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function App() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx2("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx2("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx2("link", { rel: "preconnect", href: "https://cdn.shopify.com/" }),
      /* @__PURE__ */ jsx2(
        "link",
        {
          rel: "stylesheet",
          href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        }
      ),
      /* @__PURE__ */ jsx2(
        "link",
        {
          rel: "stylesheet",
          href: "index.css"
        }
      ),
      /* @__PURE__ */ jsx2(
        "link",
        {
          rel: "stylesheet",
          href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        }
      ),
      /* @__PURE__ */ jsx2(Meta, {}),
      /* @__PURE__ */ jsx2(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx2(Outlet, {}),
      /* @__PURE__ */ jsx2(ScrollRestoration, {}),
      /* @__PURE__ */ jsx2(Scripts, {})
    ] })
  ] });
}

// app/routes/webhooks.app.scopes_update.tsx
var webhooks_app_scopes_update_exports = {};
__export(webhooks_app_scopes_update_exports, {
  action: () => action
});
var action = async ({ request }) => {
  let { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  let current = payload.current;
  return session && await db_server_default.session.update({
    where: {
      id: session.id
    },
    data: {
      scope: current.toString()
    }
  }), new Response();
};

// app/routes/webhooks.app.uninstalled.tsx
var webhooks_app_uninstalled_exports = {};
__export(webhooks_app_uninstalled_exports, {
  action: () => action2
});
var action2 = async ({ request }) => {
  let { shop, session, topic } = await authenticate.webhook(request);
  return console.log(`Received ${topic} webhook for ${shop}`), session && await db_server_default.session.deleteMany({ where: { shop } }), new Response();
};

// app/routes/webhooks.orders-create.ts
var webhooks_orders_create_exports = {};
__export(webhooks_orders_create_exports, {
  action: () => action3
});

// app/services/allocationService.ts
import { DateTime } from "luxon";
async function getLeadTimes(settings, country = "GB") {
  let override = (settings?.countryOverrides ?? {})[country] ?? {};
  return {
    despatchLead: override.despatchLead ?? settings?.defaultDespatchLead ?? 1,
    deliveryLead: override.deliveryLead ?? settings?.defaultDeliveryLead ?? 2,
    timezone: settings?.timezone ?? "Europe/London"
  };
}
async function findAndAllocateNextAvailable({
  shop,
  country = "GB",
  usedIncrease = 1,
  orderId
}) {
  let settings = await db_server_default.storeSettings.findFirst({
    where: { shop }
    // shopValue must be string
  }), { despatchLead, deliveryLead, timezone } = await getLeadTimes(
    settings,
    country
  ), cursor = DateTime.now().setZone(timezone).startOf("day"), maxDays = 90;
  for (let i = 0; i < maxDays; i++) {
    if (cursor.weekday >= 1 && cursor.weekday <= 5) {
      let dateUtc = cursor.toUTC().toJSDate(), result = await db_server_default.$transaction(async (tx) => {
        let cap = await tx.capacity.findUnique({ where: { date: dateUtc } });
        if (!cap || cap.closed || cap.usedCapacity + usedIncrease > cap.totalCapacity)
          return null;
        let updatedCap = await tx.capacity.update({
          where: { id: cap.id },
          data: { usedCapacity: cap.usedCapacity + usedIncrease }
        }), alloc = await tx.allocation.create({
          data: {
            orderId: orderId ?? "",
            capacityId: cap.id,
            despatchDate: dateUtc
          }
        });
        return { updatedCap, allocId: alloc.id, capId: cap.id };
      });
      if (result) {
        let delivery = cursor, added = 0;
        for (; added < deliveryLead; )
          delivery = delivery.plus({ days: 1 }), delivery.weekday !== 7 && added++;
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

// app/utils/shopifyAdminClient.ts
function makeAdminClient(shop, accessToken) {
  let base = `https://${shop}/admin/api/2025-07/graphql.json`;
  return {
    async graphql(query, variables) {
      return (await fetch(base, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken
        },
        body: JSON.stringify({ query, variables })
      })).json();
    }
  };
}

// app/routes/webhooks.orders-create.ts
var action3 = async ({ request }) => {
  let body = await request.json(), shop = request.headers.get("x-shopify-shop-domain") ?? void 0, orderId = String(body?.id), country = body?.shipping_address?.country_code ?? "GB", accessToken = (await db_server_default.storeSettings.findFirst({
    where: { shop }
  }))?.accessToken, allocation = await findAndAllocateNextAvailable({
    shop,
    country,
    usedIncrease: 1,
    orderId
  });
  if (!allocation)
    return Response.json({ ok: !1, message: "No slot available" }, { status: 200 });
  if (accessToken) {
    let admin = makeAdminClient(shop, accessToken), orderGid = `gid://shopify/Order/${orderId}`, tags = [
      `Advertised Delivery Date ${allocation.deliveryDateISO}`,
      `Print Date ${allocation.despatchDateISO}`
    ];
    await admin.graphql(
      `mutation tagsAdd($id: ID!, $tags: [String!]!) {
         tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
       }`,
      { id: orderGid, tags }
    ), await admin.graphql(
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
            value: allocation.deliveryDateISO
          },
          {
            namespace: "chuug",
            key: "despatch_date_iso",
            type: "single_line_text_field",
            value: allocation.despatchDateISO
          }
        ]
      }
    );
  } else
    console.warn("No access token: cannot write tags/metafields");
  return Response.json({ ok: !0, allocation });
};

// app/routes/app.capacityReport.tsx
var app_capacityReport_exports = {};
__export(app_capacityReport_exports, {
  default: () => app_capacityReport_default
});
import { useState, useEffect } from "react";
import axios from "axios";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var CapacityReportTable = () => {
  let backend = "/api/report", [report, setReport] = useState([]), [summary, setSummary] = useState(null), [loading, setLoading] = useState(!1), [startDate, setStartDate] = useState(""), [endDate, setEndDate] = useState(""), fetchReport = async () => {
    try {
      setLoading(!0);
      let params = {};
      startDate && (params.startDate = startDate), endDate && (params.endDate = endDate);
      let { data } = await axios.get(backend, { params }), formattedReport = (data.report || []).map((item) => ({
        ...item,
        totalCapacity: item.total,
        usedCapacity: item.used,
        remainingCapacity: item.total - item.used
      }));
      setReport(formattedReport);
      let totalDays = formattedReport.length, totalCapacity = formattedReport.reduce(
        (acc, cur) => acc + cur.totalCapacity,
        0
      ), usedCapacity = formattedReport.reduce((acc, cur) => acc + cur.usedCapacity, 0), remainingCapacity = totalCapacity - usedCapacity;
      setSummary({ totalDays, totalCapacity, usedCapacity, remainingCapacity });
    } catch (err) {
      console.error("Error fetching capacity report:", err);
    } finally {
      setLoading(!1);
    }
  };
  return useEffect(() => {
    fetchReport();
  }, []), /* @__PURE__ */ jsxs2("div", { className: "p-6 bg-gray-50 min-h-screen", children: [
    /* @__PURE__ */ jsx3("h1", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Capacity Report" }),
    /* @__PURE__ */ jsxs2("div", { className: "mb-6 flex flex-wrap items-center gap-4", children: [
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsx3("label", { className: "block text-sm font-medium text-gray-700", children: "Start Date" }),
        /* @__PURE__ */ jsx3(
          "input",
          {
            type: "date",
            value: startDate,
            onChange: (e) => setStartDate(e.target.value),
            className: "rounded-md border px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsx3("label", { className: "block text-sm font-medium text-gray-700", children: "End Date" }),
        /* @__PURE__ */ jsx3(
          "input",
          {
            type: "date",
            value: endDate,
            onChange: (e) => setEndDate(e.target.value),
            className: "rounded-md border px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsx3(
        "button",
        {
          onClick: fetchReport,
          className: "mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700",
          children: "Apply Filter"
        }
      )
    ] }),
    summary && /* @__PURE__ */ jsxs2("div", { className: "mb-6 rounded-lg border bg-gray-50 p-4 shadow-sm", children: [
      /* @__PURE__ */ jsx3("h3", { className: "mb-2 text-lg font-semibold text-gray-700", children: "Summary" }),
      /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsx3("p", { className: "text-sm text-gray-600", children: "Total Days" }),
          /* @__PURE__ */ jsx3("p", { className: "font-semibold", children: summary.totalDays })
        ] }),
        /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsx3("p", { className: "text-sm text-gray-600", children: "Total Capacity" }),
          /* @__PURE__ */ jsx3("p", { className: "font-semibold", children: summary.totalCapacity })
        ] }),
        /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsx3("p", { className: "text-sm text-gray-600", children: "Used Capacity" }),
          /* @__PURE__ */ jsx3("p", { className: "font-semibold text-blue-600", children: summary.usedCapacity })
        ] }),
        /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsx3("p", { className: "text-sm text-gray-600", children: "Remaining Capacity" }),
          /* @__PURE__ */ jsx3("p", { className: "font-semibold text-green-600", children: summary.remainingCapacity })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx3("div", { className: "overflow-x-auto rounded-lg border shadow-sm bg-white", children: /* @__PURE__ */ jsxs2("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ jsx3("thead", { className: "bg-gray-100", children: /* @__PURE__ */ jsxs2("tr", { children: [
        /* @__PURE__ */ jsx3("th", { className: "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600", children: "Date" }),
        /* @__PURE__ */ jsx3("th", { className: "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600", children: "Total Capacity" }),
        /* @__PURE__ */ jsx3("th", { className: "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600", children: "Used Capacity" }),
        /* @__PURE__ */ jsx3("th", { className: "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600", children: "Remaining" })
      ] }) }),
      /* @__PURE__ */ jsx3("tbody", { className: "divide-y divide-gray-100", children: loading ? /* @__PURE__ */ jsx3("tr", { children: /* @__PURE__ */ jsx3("td", { colSpan: 4, className: "px-6 py-4 text-center text-gray-500", children: "Loading..." }) }) : report.length > 0 ? report.map((item, i) => /* @__PURE__ */ jsxs2("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsx3("td", { className: "px-6 py-4 text-sm text-gray-800", children: item.date.split("T")[0] }),
        /* @__PURE__ */ jsx3("td", { className: "px-6 py-4 text-sm text-gray-800", children: item.totalCapacity }),
        /* @__PURE__ */ jsx3("td", { className: "px-6 py-4 text-sm text-blue-600 font-medium", children: item.usedCapacity }),
        /* @__PURE__ */ jsx3("td", { className: "px-6 py-4 text-sm text-green-600 font-medium", children: item.remainingCapacity })
      ] }, i)) : /* @__PURE__ */ jsx3("tr", { children: /* @__PURE__ */ jsx3("td", { colSpan: 4, className: "px-6 py-4 text-center text-gray-500 italic", children: "No records found." }) }) })
    ] }) })
  ] });
}, app_capacityReport_default = CapacityReportTable;

// app/routes/app.manageCapacity.tsx
var app_manageCapacity_exports = {};
__export(app_manageCapacity_exports, {
  default: () => app_manageCapacity_default
});
import { useState as useState2 } from "react";
import axios2 from "axios";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var ManageCapacity = () => {
  let backend = "/api/capacity", [createCapacity, setCreateCapacity] = useState2(100), [createDays, setCreateDays] = useState2(30), [updateCapacity, setUpdateCapacity] = useState2(100), [fromDate, setFromDate] = useState2(""), [toDate, setToDate] = useState2(""), [usedIncrease, setUsedIncrease] = useState2(1), [message, setMessage] = useState2(""), handleCreateCapacity = async () => {
    setMessage("Creating capacity...");
    try {
      let res = await axios2.post(`${backend}`, {
        totalCapacity: createCapacity,
        days: createDays
      });
      setMessage(`\u2705 ${res.data.message}`);
    } catch (error) {
      console.error("Error creating capacity:", error), setMessage(`\u274C ${error.response?.data?.error || "Failed to create capacity"}`);
    }
  }, handleUpdateCapacity = async () => {
    setMessage("Updating total capacity...");
    try {
      let payload = { totalCapacity: updateCapacity };
      fromDate && toDate ? (payload.fromDate = fromDate, payload.toDate = toDate) : fromDate && !toDate && (payload.fromDate = fromDate);
      let res = await axios2.put(`${backend}`, payload);
      setMessage(`\u2705 ${res.data.message}`);
    } catch (error) {
      console.error("Error updating capacity:", error), setMessage(`\u274C ${error.response?.data?.error || "Failed to update capacity"}`);
    }
  }, handleFillOrders = async () => {
    setMessage("Filling orders...");
    try {
      let res = await axios2.put(`${backend}`, { usedIncrease });
      setMessage(`\u2705 Order filled for ${res.data.updatedDate}`);
    } catch (error) {
      console.error("Error filling orders:", error), setMessage(`\u274C ${error.response?.data?.message || "No available dispatch day"}`);
    }
  };
  return /* @__PURE__ */ jsxs3("div", { className: "p-6 bg-gray-50 min-h-screen", children: [
    /* @__PURE__ */ jsx4("h1", { className: "text-2xl font-bold mb-6 text-gray-800", children: "Manage Capacity" }),
    message && /* @__PURE__ */ jsx4(
      "div",
      {
        className: `mb-4 p-3 rounded-xl text-white ${message.startsWith("\u2705") ? "bg-green-600" : message.startsWith("\u274C") ? "bg-red-600" : "bg-blue-600"}`,
        children: message
      }
    ),
    /* @__PURE__ */ jsxs3("div", { className: "p-4 bg-white shadow rounded-2xl mb-6", children: [
      /* @__PURE__ */ jsx4("h3", { className: "font-semibold mb-4 text-gray-700", children: "Create New Capacity" }),
      /* @__PURE__ */ jsxs3("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex flex-col w-full sm:w-1/3", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-sm text-gray-600 mb-1", children: "Total Capacity" }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "number",
              className: "border p-2 rounded-md",
              value: createCapacity,
              onChange: (e) => setCreateCapacity(Number(e.target.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "flex flex-col w-full sm:w-1/3", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-sm text-gray-600 mb-1", children: "Days (default 30)" }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "number",
              className: "border p-2 rounded-md",
              value: createDays,
              onChange: (e) => setCreateDays(Number(e.target.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "flex items-end", children: /* @__PURE__ */ jsx4(
          "button",
          {
            onClick: handleCreateCapacity,
            className: "bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600",
            children: "Create"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "p-4 bg-white shadow rounded-2xl mb-6", children: [
      /* @__PURE__ */ jsx4("h3", { className: "font-semibold mb-4 text-gray-700", children: "Update Total Capacity" }),
      /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-1 sm:grid-cols-5 gap-4", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-sm text-gray-600 mb-1", children: "New Total Capacity" }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "number",
              className: "border p-2 rounded-md",
              value: updateCapacity,
              onChange: (e) => setUpdateCapacity(Number(e.target.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-sm text-gray-600 mb-1", children: "From Date" }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "date",
              className: "border p-2 rounded-md",
              value: fromDate,
              onChange: (e) => setFromDate(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-sm text-gray-600 mb-1", children: "To Date (optional)" }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "date",
              className: "border p-2 rounded-md",
              value: toDate,
              onChange: (e) => setToDate(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "flex items-end", children: /* @__PURE__ */ jsx4(
          "button",
          {
            onClick: handleUpdateCapacity,
            className: "bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full",
            children: "Update"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs3("p", { className: "text-sm text-gray-500 mt-3", children: [
        /* @__PURE__ */ jsx4("b", { children: "Tips:" }),
        /* @__PURE__ */ jsx4("br", {}),
        "\u2013 Leave both dates empty \u2192 updates all future working days.",
        /* @__PURE__ */ jsx4("br", {}),
        "\u2013 Provide only ",
        /* @__PURE__ */ jsx4("b", { children: "From Date" }),
        " \u2192 updates that single date.",
        /* @__PURE__ */ jsx4("br", {}),
        "\u2013 Provide both \u2192 updates a range of dates."
      ] })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "p-4 bg-white shadow rounded-2xl", children: [
      /* @__PURE__ */ jsx4("h3", { className: "font-semibold mb-4 text-gray-700", children: "Fill Orders" }),
      /* @__PURE__ */ jsxs3("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex flex-col w-full sm:w-1/3", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-sm text-gray-600 mb-1", children: "Orders to Fill (default 1)" }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "number",
              className: "border p-2 rounded-md",
              value: usedIncrease,
              onChange: (e) => setUsedIncrease(Number(e.target.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "flex items-end", children: /* @__PURE__ */ jsx4(
          "button",
          {
            onClick: handleFillOrders,
            className: "bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600",
            children: "Fill Orders"
          }
        ) })
      ] })
    ] })
  ] });
}, app_manageCapacity_default = ManageCapacity;

// app/routes/app.manageSettings.tsx
var app_manageSettings_exports = {};
__export(app_manageSettings_exports, {
  default: () => ManageSettings
});
import { useEffect as useEffect2, useState as useState3 } from "react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function ManageSettings() {
  let [timezone, setTimezone] = useState3("Europe/London"), [despatchLead, setDespatchLead] = useState3(1), [deliveryLead, setDeliveryLead] = useState3(2), [countryOverrides, setCountryOverrides] = useState3({}), [msg, setMsg] = useState3("");
  useEffect2(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      data && (setTimezone(data.timezone ?? "Europe/London"), setDespatchLead(data.defaultDespatchLead ?? 1), setDeliveryLead(data.defaultDeliveryLead ?? 2), setCountryOverrides(data.countryOverrides ?? {}));
    });
  }, []);
  let save = async () => {
    setMsg("Saving...");
    let j = await (await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timezone,
        defaultDespatchLead: despatchLead,
        defaultDeliveryLead: deliveryLead,
        countryOverrides
      })
    })).json();
    setMsg(j.ok ? "\u2705 Saved successfully" : "\u274C Error saving settings");
  };
  return /* @__PURE__ */ jsxs4("div", { className: "p-6 bg-gray-50 min-h-screen", children: [
    /* @__PURE__ */ jsx5("h1", { className: "text-2xl font-bold mb-6 text-gray-800", children: "Manage Store Settings" }),
    msg && /* @__PURE__ */ jsx5(
      "div",
      {
        className: `mb-4 p-3 rounded-xl text-white ${msg.startsWith("\u2705") ? "bg-green-600" : msg.startsWith("\u274C") ? "bg-red-600" : "bg-blue-600"}`,
        children: msg
      }
    ),
    /* @__PURE__ */ jsxs4("div", { className: "p-4 bg-white shadow rounded-2xl mb-6", children: [
      /* @__PURE__ */ jsx5("h3", { className: "font-semibold mb-4 text-gray-700", children: "General Settings" }),
      /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs4("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx5("label", { className: "text-sm text-gray-600 mb-1", children: "Timezone" }),
          /* @__PURE__ */ jsx5(
            "input",
            {
              className: "border p-2 rounded-md",
              value: timezone,
              onChange: (e) => setTimezone(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx5("label", { className: "text-sm text-gray-600 mb-1", children: "Default Despatch Lead (days)" }),
          /* @__PURE__ */ jsx5(
            "input",
            {
              type: "number",
              className: "border p-2 rounded-md",
              value: despatchLead,
              onChange: (e) => setDespatchLead(Number(e.target.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx5("label", { className: "text-sm text-gray-600 mb-1", children: "Default Delivery Lead (days)" }),
          /* @__PURE__ */ jsx5(
            "input",
            {
              type: "number",
              className: "border p-2 rounded-md",
              value: deliveryLead,
              onChange: (e) => setDeliveryLead(Number(e.target.value))
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "p-4 bg-white shadow rounded-2xl mb-6", children: [
      /* @__PURE__ */ jsx5("h3", { className: "font-semibold mb-4 text-gray-700", children: "Country Overrides" }),
      Object.entries(countryOverrides).map(([country, leads]) => /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-4 gap-2 items-end mb-3", children: [
        /* @__PURE__ */ jsxs4("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx5("label", { className: "text-xs text-gray-500 mb-1", children: "Country" }),
          /* @__PURE__ */ jsx5(
            "input",
            {
              className: "border p-2 rounded-md w-full text-center",
              value: country,
              onChange: (e) => {
                let newOverrides = { ...countryOverrides };
                newOverrides[e.target.value] = leads, e.target.value !== country && delete newOverrides[country], setCountryOverrides(newOverrides);
              },
              placeholder: "Country code"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx5("label", { className: "text-xs text-gray-500 mb-1", children: "Despatch Lead (days)" }),
          /* @__PURE__ */ jsx5(
            "input",
            {
              type: "number",
              className: "border p-2 rounded-md w-full",
              value: leads.despatchLead,
              onChange: (e) => {
                let newOverrides = { ...countryOverrides };
                newOverrides[country] = { ...leads, despatchLead: Number(e.target.value) }, setCountryOverrides(newOverrides);
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx5("label", { className: "text-xs text-gray-500 mb-1", children: "Delivery Lead (days)" }),
          /* @__PURE__ */ jsx5(
            "input",
            {
              type: "number",
              className: "border p-2 rounded-md w-full",
              value: leads.deliveryLead,
              onChange: (e) => {
                let newOverrides = { ...countryOverrides };
                newOverrides[country] = { ...leads, deliveryLead: Number(e.target.value) }, setCountryOverrides(newOverrides);
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsx5("div", { className: "flex flex-col", children: /* @__PURE__ */ jsx5(
          "button",
          {
            className: "bg-red-500 text-white px-2 py-1 rounded mt-5",
            onClick: () => {
              let newOverrides = { ...countryOverrides };
              delete newOverrides[country], setCountryOverrides(newOverrides);
            },
            children: "Remove"
          }
        ) })
      ] }, country)),
      /* @__PURE__ */ jsx5(
        "button",
        {
          className: "mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
          onClick: () => {
            let newOverrides = { ...countryOverrides }, newKey = "NEW", counter = 1;
            for (; newOverrides[newKey]; )
              newKey = `NEW${counter++}`;
            newOverrides[newKey] = { despatchLead: 1, deliveryLead: 1 }, setCountryOverrides(newOverrides);
          },
          children: "Add Country"
        }
      )
    ] }),
    /* @__PURE__ */ jsx5(
      "button",
      {
        onClick: save,
        className: "bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 shadow",
        children: "Save Settings"
      }
    )
  ] });
}

// app/routes/api.next-despatch.ts
var api_next_despatch_exports = {};
__export(api_next_despatch_exports, {
  loader: () => loader
});
import { DateTime as DateTime2 } from "luxon";
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
async function loader({ request }) {
  if (request.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  try {
    let country = new URL(request.url).searchParams.get("country") ?? "GB", settings = await db_server_default.storeSettings.findFirst();
    if (!settings)
      return corsResponse(
        { error: "Store settings not found" },
        500
      );
    let tz = settings.timezone ?? "Europe/London", { despatchLead, deliveryLead } = await getLeadTimes(settings, country), cursor = DateTime2.now().setZone(tz).startOf("day");
    for (let i = 0; i < 60; i++) {
      if (cursor.weekday >= 1 && cursor.weekday <= 5) {
        let dateUtc = cursor.toUTC().toJSDate(), cap = await db_server_default.capacity.findUnique({
          where: { date: dateUtc }
        });
        if (cap && !cap.closed && cap.usedCapacity < cap.totalCapacity) {
          let delivery = cursor, added = 0;
          for (; added < deliveryLead; )
            delivery = delivery.plus({ days: 1 }), delivery.weekday !== 7 && added++;
          return corsResponse({
            despatchDateISO: cursor.toISODate(),
            despatchDateText: cursor.toFormat("d LLLL yyyy"),
            deliveryDateISO: delivery.toISODate(),
            deliveryDateText: delivery.toFormat("d LLLL yyyy"),
            remaining: cap.totalCapacity - cap.usedCapacity
          });
        }
      }
      cursor = cursor.plus({ days: 1 });
    }
    return corsResponse({ error: "No available despatch date" }, 404);
  } catch (error) {
    return console.error("API ERROR:", error), corsResponse(
      { error: "Internal server error", details: error.message },
      500
    );
  }
}

// app/routes/app.additional.tsx
var app_additional_exports = {};
__export(app_additional_exports, {
  default: () => AdditionalPage
});
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function AdditionalPage() {
  return /* @__PURE__ */ jsxs5("s-page", { heading: "Additional page", children: [
    /* @__PURE__ */ jsxs5("s-section", { heading: "Multiple pages", children: [
      /* @__PURE__ */ jsxs5("s-paragraph", { children: [
        "The app template comes with an additional page which demonstrates how to create multiple pages within app navigation using",
        " ",
        /* @__PURE__ */ jsx6(
          "s-link",
          {
            href: "https://shopify.dev/docs/apps/tools/app-bridge",
            target: "_blank",
            children: "App Bridge"
          }
        ),
        "."
      ] }),
      /* @__PURE__ */ jsxs5("s-paragraph", { children: [
        "To create your own page and have it show up in the app navigation, add a page inside ",
        /* @__PURE__ */ jsx6("code", { children: "app/routes" }),
        ", and a link to it in the",
        " ",
        /* @__PURE__ */ jsx6("code", { children: "<ui-nav-menu>" }),
        " component found in",
        " ",
        /* @__PURE__ */ jsx6("code", { children: "app/routes/app.jsx" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsx6("s-section", { slot: "aside", heading: "Resources", children: /* @__PURE__ */ jsx6("s-unordered-list", { children: /* @__PURE__ */ jsx6("s-list-item", { children: /* @__PURE__ */ jsx6(
      "s-link",
      {
        href: "https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav",
        target: "_blank",
        children: "App nav best practices"
      }
    ) }) }) })
  ] });
}

// app/routes/app.dashboard.tsx
var app_dashboard_exports = {};
__export(app_dashboard_exports, {
  default: () => DashboardPage,
  loader: () => loader2
});
import { useEffect as useEffect3, useState as useState4 } from "react";
import axios3 from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { useAppBridge } from "@shopify/app-bridge-react";
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
var loader2 = async ({ request }) => (await authenticate.admin(request), null);
function DashboardPage() {
  let backend = "/api/report", shopify2 = useAppBridge(), [data, setData] = useState4([]), [fromDate, setFromDate] = useState4(""), [toDate, setToDate] = useState4(""), [loading, setLoading] = useState4(!1), fetchReport = async () => {
    try {
      setLoading(!0);
      let params = {};
      fromDate && (params.startDate = fromDate), toDate && (params.endDate = toDate);
      let mappedData = ((await axios3.get(backend, { params })).data.report || []).map((item) => ({
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
      setLoading(!1);
    }
  };
  useEffect3(() => {
    fetchReport();
  }, []);
  let totalCapacities = data.reduce((sum, d) => sum + d.totalCapacity, 0), usedCapacities = data.reduce((sum, d) => sum + d.usedCapacity, 0), remainingCapacities = totalCapacities - usedCapacities, chartData = {
    labels: data.map((d) => new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })),
    datasets: [
      {
        label: "Total Capacity",
        data: data.map((d) => d.totalCapacity),
        borderColor: "rgba(59,130,246,1)",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
        fill: !0
      },
      {
        label: "Used Capacity",
        data: data.map((d) => d.usedCapacity),
        borderColor: "rgba(239,68,68,1)",
        backgroundColor: "rgba(239,68,68,0.2)",
        tension: 0.3,
        fill: !0
      }
    ]
  }, chartOptions = {
    responsive: !0,
    maintainAspectRatio: !1,
    // This is crucial!
    plugins: {
      legend: {
        position: "top",
        display: !0
      },
      title: {
        display: !0,
        text: "Capacity Overview"
      }
    },
    scales: {
      x: {
        display: !0,
        title: {
          display: !0,
          text: "Date"
        }
      },
      y: {
        display: !0,
        title: {
          display: !0,
          text: "Capacity"
        },
        beginAtZero: !0
      }
    }
  };
  return /* @__PURE__ */ jsx7("s-page", { heading: "Dashboard", children: /* @__PURE__ */ jsx7("s-section", { heading: "Capacity Overview", children: /* @__PURE__ */ jsxs6("s-box", { padding: "base", background: "subdued", children: [
    /* @__PURE__ */ jsxs6("div", { className: "flex gap-3 mb-4", children: [
      /* @__PURE__ */ jsx7(
        "input",
        {
          type: "date",
          value: fromDate,
          onChange: (e) => setFromDate(e.target.value),
          className: "border p-2 rounded-md"
        }
      ),
      /* @__PURE__ */ jsx7(
        "input",
        {
          type: "date",
          value: toDate,
          onChange: (e) => setToDate(e.target.value),
          className: "border p-2 rounded-md"
        }
      ),
      /* @__PURE__ */ jsx7("s-button", { onClick: fetchReport, children: "Apply Filter" })
    ] }),
    /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-3 gap-3 mb-6", children: [
      /* @__PURE__ */ jsxs6("s-card", { children: [
        /* @__PURE__ */ jsx7("s-text", { children: "Total" }),
        /* @__PURE__ */ jsx7("s-text", { children: totalCapacities })
      ] }),
      /* @__PURE__ */ jsxs6("s-card", { children: [
        /* @__PURE__ */ jsx7("s-text", { children: "Used" }),
        /* @__PURE__ */ jsx7("s-text", { children: usedCapacities })
      ] }),
      /* @__PURE__ */ jsxs6("s-card", { children: [
        /* @__PURE__ */ jsx7("s-text", { children: "Remaining" }),
        /* @__PURE__ */ jsx7("s-text", { children: remainingCapacities })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx7("s-text", { children: "Loading report..." }) : data.length > 0 ? /* @__PURE__ */ jsx7("div", { style: { height: "400px", width: "100%" }, children: /* @__PURE__ */ jsx7(Line, { data: chartData, options: chartOptions }) }) : /* @__PURE__ */ jsx7("s-text", { children: "No data available for selected range." })
  ] }) }) });
}

// app/routes/api.capacity.ts
var api_capacity_exports = {};
__export(api_capacity_exports, {
  action: () => action4,
  loader: () => loader3
});
async function loader3({ request }) {
  let capacities = await db_server_default.capacity.findMany();
  return Response.json(capacities);
}
async function action4({ request }) {
  if (request.method === "PUT") {
    let body = await request.json();
    if (body.usedIncrease) {
      let usedIncrease = parseInt(body.usedIncrease), today2 = /* @__PURE__ */ new Date();
      today2.setHours(0, 0, 0, 0);
      let nextDay = await db_server_default.capacity.findFirst({
        where: {
          date: { gte: today2 },
          // 👈 ONLY future or today
          usedCapacity: { lt: db_server_default.capacity.fields.totalCapacity }
          // space available
        },
        orderBy: { date: "asc" }
      });
      return nextDay ? (await db_server_default.capacity.update({
        where: { id: nextDay.id },
        data: {
          usedCapacity: nextDay.usedCapacity + usedIncrease
        }
      }), Response.json({
        message: "Order filled",
        updatedDate: nextDay.date
      })) : Response.json(
        { message: "\u274C No available dispatch day" },
        { status: 400 }
      );
    }
    let { totalCapacity: totalCapacity2, fromDate, toDate } = body;
    if (!totalCapacity2)
      return Response.json(
        { message: "\u274C totalCapacity is required" },
        { status: 400 }
      );
    let startDate = fromDate ? new Date(fromDate) : /* @__PURE__ */ new Date(), endDate = toDate ? new Date(toDate) : null;
    startDate.setUTCHours(0, 0, 0, 0), endDate && endDate.setUTCHours(23, 59, 59, 999);
    let whereClause;
    endDate ? whereClause = { date: { gte: startDate, lte: endDate } } : fromDate ? whereClause = { date: startDate } : whereClause = { date: { gte: startDate } };
    let existingCaps = await db_server_default.capacity.findMany({
      where: whereClause,
      orderBy: { date: "asc" }
    }), updatedCount = 0, createdCount = 0, loopEnd = endDate ? new Date(endDate) : new Date(startDate);
    !endDate && !fromDate && loopEnd.setDate(startDate.getDate() + 30);
    for (let d = new Date(startDate); d <= loopEnd; d.setDate(d.getDate() + 1)) {
      let dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6)
        continue;
      let isoDate = d.toISOString().split("T")[0], existing = existingCaps.find(
        (c) => new Date(c.date).toISOString().split("T")[0] === isoDate
      );
      existing ? (await db_server_default.capacity.update({
        where: { id: existing.id },
        data: { totalCapacity: parseInt(totalCapacity2) }
      }), updatedCount++) : (await db_server_default.capacity.create({
        data: {
          date: new Date(d),
          totalCapacity: parseInt(totalCapacity2),
          usedCapacity: 0
        }
      }), createdCount++);
    }
    let message;
    return endDate ? message = `Capacity updated for ${updatedCount} and created for ${createdCount} working days between ${startDate.toISOString().split("T")[0]} and ${endDate.toISOString().split("T")[0]}.` : fromDate ? message = `Capacity updated/created for ${updatedCount + createdCount} record(s) on ${startDate.toISOString().split("T")[0]}.` : message = `Capacity updated for ${updatedCount} and created for ${createdCount} working days starting from ${startDate.toISOString().split("T")[0]}.`, Response.json({
      message,
      updatedCount,
      createdCount
    });
  }
  let { totalCapacity, days = 30 } = await request.json(), today = /* @__PURE__ */ new Date(), capacities = [], createdDays = 0, offset = 0;
  for (; createdDays < days; ) {
    let date = new Date(today);
    date.setDate(today.getDate() + offset);
    let dayOfWeek = date.getDay();
    if (offset++, dayOfWeek === 0 || dayOfWeek === 6)
      continue;
    let dateOnly = new Date(date.toISOString().split("T")[0]);
    if (!await db_server_default.capacity.findFirst({
      where: { date: dateOnly }
    })) {
      let newCap = await db_server_default.capacity.create({
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

// app/routes/api.settings.ts
var api_settings_exports = {};
__export(api_settings_exports, {
  action: () => action5,
  loader: () => loader4
});
async function loader4({ request }) {
  let settings = await db_server_default.storeSettings.findFirst();
  return Response.json(settings ?? {});
}
async function action5({ request }) {
  let body = await request.json(), { timezone, defaultDespatchLead, defaultDeliveryLead, countryOverrides } = body;
  if (!timezone || defaultDespatchLead === void 0 || defaultDeliveryLead === void 0)
    return Response.json({ ok: !1, error: "Missing required fields" }, { status: 400 });
  let existing = await db_server_default.storeSettings.findFirst();
  if (existing) {
    let updated = await db_server_default.storeSettings.update({
      where: { id: existing.id },
      data: {
        timezone,
        defaultDespatchLead,
        defaultDeliveryLead,
        countryOverrides
      }
    });
    return Response.json({ ok: !0, updated });
  } else {
    let created = await db_server_default.storeSettings.create({
      data: {
        timezone,
        defaultDespatchLead,
        defaultDeliveryLead,
        countryOverrides
      }
    });
    return Response.json({ ok: !0, created });
  }
}

// app/routes/api.report.ts
var api_report_exports = {};
__export(api_report_exports, {
  loader: () => loader5
});
var loader5 = async ({ request }) => {
  let url = new URL(request.url), startDate = url.searchParams.get("startDate"), endDate = url.searchParams.get("endDate"), whereClause = {};
  if (startDate && endDate)
    whereClause.date = { gte: new Date(startDate), lte: new Date(endDate) };
  else if (startDate) {
    let d = new Date(startDate);
    d.setUTCHours(0, 0, 0, 0), whereClause.date = d;
  }
  let report = (await db_server_default.capacity.findMany({
    where: whereClause,
    orderBy: { date: "asc" }
  })).map((c) => ({
    date: c.date,
    used: c.usedCapacity,
    total: c.totalCapacity
  }));
  return Response.json({ success: !0, report });
};

// app/routes/app._index.tsx
var app_index_exports = {};
__export(app_index_exports, {
  action: () => action6,
  default: () => Index,
  headers: () => headers,
  loader: () => loader6
});
import { useEffect as useEffect4 } from "react";
import { useFetcher } from "react-router";
import { useAppBridge as useAppBridge2 } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
var loader6 = async ({ request }) => (await authenticate.admin(request), null), action6 = async ({ request }) => {
  let { admin } = await authenticate.admin(request), color = ["Red", "Orange", "Yellow", "Green"][Math.floor(Math.random() * 4)], responseJson = await (await admin.graphql(
    `#graphql
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
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`
        }
      }
    }
  )).json(), product = responseJson.data.productCreate.product, variantId = product.variants.edges[0].node.id, variantResponseJson = await (await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }]
      }
    }
  )).json();
  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants
  };
};
function Index() {
  let fetcher = useFetcher(), shopify2 = useAppBridge2(), isLoading = ["loading", "submitting"].includes(fetcher.state) && fetcher.formMethod === "POST";
  useEffect4(() => {
    fetcher.data?.product?.id && shopify2.toast.show("Product created");
  }, [fetcher.data?.product?.id, shopify2]);
  let generateProduct = () => fetcher.submit({}, { method: "POST" });
  return /* @__PURE__ */ jsxs7("s-page", { heading: "Shopify app template", children: [
    /* @__PURE__ */ jsx8("s-button", { slot: "primary-action", onClick: generateProduct, children: "Generate a product" }),
    /* @__PURE__ */ jsx8("s-section", { heading: "Congrats on creating a new Shopify app \u{1F389}", children: /* @__PURE__ */ jsxs7("s-paragraph", { children: [
      "This embedded app template uses",
      " ",
      /* @__PURE__ */ jsx8(
        "s-link",
        {
          href: "https://shopify.dev/docs/apps/tools/app-bridge",
          target: "_blank",
          children: "App Bridge"
        }
      ),
      " ",
      "interface examples like an",
      " ",
      /* @__PURE__ */ jsx8("s-link", { href: "/app/additional", children: "additional page in the app nav" }),
      ", as well as an",
      " ",
      /* @__PURE__ */ jsx8(
        "s-link",
        {
          href: "https://shopify.dev/docs/api/admin-graphql",
          target: "_blank",
          children: "Admin GraphQL"
        }
      ),
      " ",
      "mutation demo, to provide a starting point for app development."
    ] }) }),
    /* @__PURE__ */ jsxs7("s-section", { heading: "Get started with products", children: [
      /* @__PURE__ */ jsxs7("s-paragraph", { children: [
        "Generate a product with GraphQL and get the JSON output for that product. Learn more about the",
        " ",
        /* @__PURE__ */ jsx8(
          "s-link",
          {
            href: "https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate",
            target: "_blank",
            children: "productCreate"
          }
        ),
        " ",
        "mutation in our API references."
      ] }),
      /* @__PURE__ */ jsxs7("s-stack", { direction: "inline", gap: "base", children: [
        /* @__PURE__ */ jsx8(
          "s-button",
          {
            onClick: generateProduct,
            ...isLoading ? { loading: !0 } : {},
            children: "Generate a product"
          }
        ),
        fetcher.data?.product && /* @__PURE__ */ jsx8(
          "s-button",
          {
            onClick: () => {
              shopify2.intents.invoke?.("edit:shopify/Product", {
                value: fetcher.data?.product?.id
              });
            },
            target: "_blank",
            variant: "tertiary",
            children: "Edit product"
          }
        )
      ] }),
      fetcher.data?.product && /* @__PURE__ */ jsx8("s-section", { heading: "productCreate mutation", children: /* @__PURE__ */ jsxs7("s-stack", { direction: "block", gap: "base", children: [
        /* @__PURE__ */ jsx8(
          "s-box",
          {
            padding: "base",
            borderWidth: "base",
            borderRadius: "base",
            background: "subdued",
            children: /* @__PURE__ */ jsx8("pre", { style: { margin: 0 }, children: /* @__PURE__ */ jsx8("code", { children: JSON.stringify(fetcher.data.product, null, 2) }) })
          }
        ),
        /* @__PURE__ */ jsx8("s-heading", { children: "productVariantsBulkUpdate mutation" }),
        /* @__PURE__ */ jsx8(
          "s-box",
          {
            padding: "base",
            borderWidth: "base",
            borderRadius: "base",
            background: "subdued",
            children: /* @__PURE__ */ jsx8("pre", { style: { margin: 0 }, children: /* @__PURE__ */ jsx8("code", { children: JSON.stringify(fetcher.data.variant, null, 2) }) })
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs7("s-section", { slot: "aside", heading: "App template specs", children: [
      /* @__PURE__ */ jsxs7("s-paragraph", { children: [
        /* @__PURE__ */ jsx8("s-text", { children: "Framework: " }),
        /* @__PURE__ */ jsx8("s-link", { href: "https://reactrouter.com/", target: "_blank", children: "React Router" })
      ] }),
      /* @__PURE__ */ jsxs7("s-paragraph", { children: [
        /* @__PURE__ */ jsx8("s-text", { children: "Interface: " }),
        /* @__PURE__ */ jsx8(
          "s-link",
          {
            href: "https://shopify.dev/docs/api/app-home/using-polaris-components",
            target: "_blank",
            children: "Polaris web components"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs7("s-paragraph", { children: [
        /* @__PURE__ */ jsx8("s-text", { children: "API: " }),
        /* @__PURE__ */ jsx8(
          "s-link",
          {
            href: "https://shopify.dev/docs/api/admin-graphql",
            target: "_blank",
            children: "GraphQL"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs7("s-paragraph", { children: [
        /* @__PURE__ */ jsx8("s-text", { children: "Database: " }),
        /* @__PURE__ */ jsx8("s-link", { href: "https://www.prisma.io/", target: "_blank", children: "Prisma" })
      ] })
    ] }),
    /* @__PURE__ */ jsx8("s-section", { slot: "aside", heading: "Next steps", children: /* @__PURE__ */ jsxs7("s-unordered-list", { children: [
      /* @__PURE__ */ jsxs7("s-list-item", { children: [
        "Build an",
        " ",
        /* @__PURE__ */ jsx8(
          "s-link",
          {
            href: "https://shopify.dev/docs/apps/getting-started/build-app-example",
            target: "_blank",
            children: "example app"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs7("s-list-item", { children: [
        "Explore Shopify's API with",
        " ",
        /* @__PURE__ */ jsx8(
          "s-link",
          {
            href: "https://shopify.dev/docs/apps/tools/graphiql-admin-api",
            target: "_blank",
            children: "GraphiQL"
          }
        )
      ] })
    ] }) })
  ] });
}
var headers = (headersArgs) => boundary.headers(headersArgs);

// app/routes/auth.login/route.tsx
var route_exports = {};
__export(route_exports, {
  action: () => action7,
  default: () => Auth,
  loader: () => loader7
});
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { useState as useState5 } from "react";
import { Form, useActionData, useLoaderData } from "react-router";

// app/routes/auth.login/error.server.tsx
import { LoginErrorType } from "@shopify/shopify-app-react-router/server";
function loginErrorMessage(loginErrors) {
  return loginErrors?.shop === LoginErrorType.MissingShop ? { shop: "Please enter your shop domain to log in" } : loginErrors?.shop === LoginErrorType.InvalidShop ? { shop: "Please enter a valid shop domain to log in" } : {};
}

// app/routes/auth.login/route.tsx
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
var loader7 = async ({ request }) => ({ errors: loginErrorMessage(await login(request)) }), action7 = async ({ request }) => ({
  errors: loginErrorMessage(await login(request))
});
function Auth() {
  let loaderData = useLoaderData(), actionData = useActionData(), [shop, setShop] = useState5(""), { errors } = actionData || loaderData;
  return /* @__PURE__ */ jsx9(AppProvider, { embedded: !1, children: /* @__PURE__ */ jsx9("s-page", { children: /* @__PURE__ */ jsx9(Form, { method: "post", children: /* @__PURE__ */ jsxs8("s-section", { heading: "Log in", children: [
    /* @__PURE__ */ jsx9(
      "s-text-field",
      {
        name: "shop",
        label: "Shop domain",
        details: "example.myshopify.com",
        value: shop,
        onChange: (e) => setShop(e.currentTarget.value),
        autocomplete: "on",
        error: errors.shop
      }
    ),
    /* @__PURE__ */ jsx9("s-button", { type: "submit", children: "Log in" })
  ] }) }) }) });
}

// app/routes/auth.$.tsx
var auth_exports = {};
__export(auth_exports, {
  headers: () => headers2,
  loader: () => loader8
});
import { boundary as boundary2 } from "@shopify/shopify-app-react-router/server";
var loader8 = async ({ request }) => (await authenticate.admin(request), null), headers2 = (headersArgs) => boundary2.headers(headersArgs);

// app/routes/_index/route.tsx
var route_exports2 = {};
__export(route_exports2, {
  default: () => App2,
  loader: () => loader9
});
import { redirect, Form as Form2, useLoaderData as useLoaderData2 } from "react-router";

// app/routes/_index/styles.module.css
var styles_module_default = { index: "LQCYp", heading: "bVg-E", text: "_5LEJl", content: "IjJz7", form: "sI1Wg", label: "py2aZ", input: "k8y5b", button: "DcRe8", list: "qyGLW" };

// app/routes/_index/route.tsx
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
var loader9 = async ({ request }) => {
  let url = new URL(request.url);
  if (url.searchParams.get("shop"))
    throw redirect(`/app?${url.searchParams.toString()}`);
  return { showForm: Boolean(login) };
};
function App2() {
  let { showForm } = useLoaderData2();
  return /* @__PURE__ */ jsx10("div", { className: styles_module_default.index, children: /* @__PURE__ */ jsxs9("div", { className: styles_module_default.content, children: [
    /* @__PURE__ */ jsx10("h1", { className: styles_module_default.heading, children: "A short heading about [your app]" }),
    /* @__PURE__ */ jsx10("p", { className: styles_module_default.text, children: "A tagline about [your app] that describes your value proposition." }),
    showForm && /* @__PURE__ */ jsxs9(Form2, { className: styles_module_default.form, method: "post", action: "/auth/login", children: [
      /* @__PURE__ */ jsxs9("label", { className: styles_module_default.label, children: [
        /* @__PURE__ */ jsx10("span", { children: "Shop domain" }),
        /* @__PURE__ */ jsx10("input", { className: styles_module_default.input, type: "text", name: "shop" }),
        /* @__PURE__ */ jsx10("span", { children: "e.g: my-shop-domain.myshopify.com" })
      ] }),
      /* @__PURE__ */ jsx10("button", { className: styles_module_default.button, type: "submit", children: "Log in" })
    ] }),
    /* @__PURE__ */ jsxs9("ul", { className: styles_module_default.list, children: [
      /* @__PURE__ */ jsxs9("li", { children: [
        /* @__PURE__ */ jsx10("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs9("li", { children: [
        /* @__PURE__ */ jsx10("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs9("li", { children: [
        /* @__PURE__ */ jsx10("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] })
    ] })
  ] }) });
}

// app/routes/app.tsx
var app_exports = {};
__export(app_exports, {
  ErrorBoundary: () => ErrorBoundary,
  default: () => App3,
  headers: () => headers3,
  loader: () => loader10
});
import { Outlet as Outlet2, useLoaderData as useLoaderData3, useRouteError } from "react-router";
import { boundary as boundary3 } from "@shopify/shopify-app-react-router/server";
import { AppProvider as AppProvider2 } from "@shopify/shopify-app-react-router/react";
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
var loader10 = async ({ request }) => (await authenticate.admin(request), { apiKey: process.env.SHOPIFY_API_KEY || "" });
function App3() {
  let { apiKey } = useLoaderData3();
  return /* @__PURE__ */ jsxs10(AppProvider2, { embedded: !0, apiKey, children: [
    /* @__PURE__ */ jsxs10("s-app-nav", { children: [
      /* @__PURE__ */ jsx11("s-link", { href: "/app", children: "Home" }),
      /* @__PURE__ */ jsx11("s-link", { href: "/app/dashboard", children: "Dashboard" }),
      /* @__PURE__ */ jsx11("s-link", { href: "/app/manageCapacity", children: "Manage Capacity" }),
      /* @__PURE__ */ jsx11("s-link", { href: "/app/capacityReport", children: "Capacity Report" }),
      /* @__PURE__ */ jsx11("s-link", { href: "/app/manageSettings", children: "Manage Settings" })
    ] }),
    /* @__PURE__ */ jsx11(Outlet2, {})
  ] });
}
function ErrorBoundary() {
  return boundary3.error(useRouteError());
}
var headers3 = (headersArgs) => boundary3.headers(headersArgs);

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-424GB6QW.js", imports: ["/build/_shared/chunk-2Z2BTQU4.js", "/build/_shared/chunk-ZT4QWOFN.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-YGB43K26.js", imports: ["/build/_shared/chunk-JK3HBVHX.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-W6NBW3KJ.js", imports: ["/build/_shared/chunk-DALHQWPH.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.capacity": { id: "routes/api.capacity", parentId: "root", path: "api/capacity", index: void 0, caseSensitive: void 0, module: "/build/routes/api.capacity-KSG6XYSF.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.next-despatch": { id: "routes/api.next-despatch", parentId: "root", path: "api/next-despatch", index: void 0, caseSensitive: void 0, module: "/build/routes/api.next-despatch-5ZCNNHPC.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.report": { id: "routes/api.report", parentId: "root", path: "api/report", index: void 0, caseSensitive: void 0, module: "/build/routes/api.report-K7R7PQYP.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.settings": { id: "routes/api.settings", parentId: "root", path: "api/settings", index: void 0, caseSensitive: void 0, module: "/build/routes/api.settings-YL7KAKIS.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/app": { id: "routes/app", parentId: "root", path: "app", index: void 0, caseSensitive: void 0, module: "/build/routes/app-2GHM43HD.js", imports: ["/build/_shared/chunk-RXXFRAYH.js", "/build/_shared/chunk-S2K7JZKI.js", "/build/_shared/chunk-STTVP7OZ.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !0 }, "routes/app._index": { id: "routes/app._index", parentId: "routes/app", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/app._index-DRATTA32.js", imports: ["/build/_shared/chunk-6WVOJ5YU.js", "/build/_shared/chunk-JK3HBVHX.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/app.additional": { id: "routes/app.additional", parentId: "routes/app", path: "additional", index: void 0, caseSensitive: void 0, module: "/build/routes/app.additional-K5G7VOR6.js", imports: void 0, hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/app.capacityReport": { id: "routes/app.capacityReport", parentId: "routes/app", path: "capacityReport", index: void 0, caseSensitive: void 0, module: "/build/routes/app.capacityReport-JD7H5UCV.js", imports: ["/build/_shared/chunk-VAO34ZN6.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/app.dashboard": { id: "routes/app.dashboard", parentId: "routes/app", path: "dashboard", index: void 0, caseSensitive: void 0, module: "/build/routes/app.dashboard-DGJ7IGUP.js", imports: ["/build/_shared/chunk-6WVOJ5YU.js", "/build/_shared/chunk-VAO34ZN6.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/app.manageCapacity": { id: "routes/app.manageCapacity", parentId: "routes/app", path: "manageCapacity", index: void 0, caseSensitive: void 0, module: "/build/routes/app.manageCapacity-GAAAPK4S.js", imports: ["/build/_shared/chunk-VAO34ZN6.js"], hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/app.manageSettings": { id: "routes/app.manageSettings", parentId: "routes/app", path: "manageSettings", index: void 0, caseSensitive: void 0, module: "/build/routes/app.manageSettings-5Q57UI3A.js", imports: void 0, hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.$": { id: "routes/auth.$", parentId: "root", path: "auth/*", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.$-B7OTCXNB.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/auth.login": { id: "routes/auth.login", parentId: "root", path: "auth/login", index: void 0, caseSensitive: void 0, module: "/build/routes/auth.login-ZIL6NBKK.js", imports: ["/build/_shared/chunk-DALHQWPH.js", "/build/_shared/chunk-STTVP7OZ.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/webhooks.app.scopes_update": { id: "routes/webhooks.app.scopes_update", parentId: "root", path: "webhooks/app/scopes_update", index: void 0, caseSensitive: void 0, module: "/build/routes/webhooks.app.scopes_update-UEWKO7RC.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/webhooks.app.uninstalled": { id: "routes/webhooks.app.uninstalled", parentId: "root", path: "webhooks/app/uninstalled", index: void 0, caseSensitive: void 0, module: "/build/routes/webhooks.app.uninstalled-ZZXKSPMR.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/webhooks.orders-create": { id: "routes/webhooks.orders-create", parentId: "root", path: "webhooks/orders-create", index: void 0, caseSensitive: void 0, module: "/build/routes/webhooks.orders-create-SX77SV4N.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "ad73ff15", hmr: void 0, url: "/build/manifest-AD73FF15.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "production", assetsBuildDirectory = "public\\build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, v3_routeConfig: !1, v3_singleFetch: !1, v3_lazyRouteDiscovery: !1, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/webhooks.app.scopes_update": {
    id: "routes/webhooks.app.scopes_update",
    parentId: "root",
    path: "webhooks/app/scopes_update",
    index: void 0,
    caseSensitive: void 0,
    module: webhooks_app_scopes_update_exports
  },
  "routes/webhooks.app.uninstalled": {
    id: "routes/webhooks.app.uninstalled",
    parentId: "root",
    path: "webhooks/app/uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: webhooks_app_uninstalled_exports
  },
  "routes/webhooks.orders-create": {
    id: "routes/webhooks.orders-create",
    parentId: "root",
    path: "webhooks/orders-create",
    index: void 0,
    caseSensitive: void 0,
    module: webhooks_orders_create_exports
  },
  "routes/app.capacityReport": {
    id: "routes/app.capacityReport",
    parentId: "routes/app",
    path: "capacityReport",
    index: void 0,
    caseSensitive: void 0,
    module: app_capacityReport_exports
  },
  "routes/app.manageCapacity": {
    id: "routes/app.manageCapacity",
    parentId: "routes/app",
    path: "manageCapacity",
    index: void 0,
    caseSensitive: void 0,
    module: app_manageCapacity_exports
  },
  "routes/app.manageSettings": {
    id: "routes/app.manageSettings",
    parentId: "routes/app",
    path: "manageSettings",
    index: void 0,
    caseSensitive: void 0,
    module: app_manageSettings_exports
  },
  "routes/api.next-despatch": {
    id: "routes/api.next-despatch",
    parentId: "root",
    path: "api/next-despatch",
    index: void 0,
    caseSensitive: void 0,
    module: api_next_despatch_exports
  },
  "routes/app.additional": {
    id: "routes/app.additional",
    parentId: "routes/app",
    path: "additional",
    index: void 0,
    caseSensitive: void 0,
    module: app_additional_exports
  },
  "routes/app.dashboard": {
    id: "routes/app.dashboard",
    parentId: "routes/app",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: app_dashboard_exports
  },
  "routes/api.capacity": {
    id: "routes/api.capacity",
    parentId: "root",
    path: "api/capacity",
    index: void 0,
    caseSensitive: void 0,
    module: api_capacity_exports
  },
  "routes/api.settings": {
    id: "routes/api.settings",
    parentId: "root",
    path: "api/settings",
    index: void 0,
    caseSensitive: void 0,
    module: api_settings_exports
  },
  "routes/api.report": {
    id: "routes/api.report",
    parentId: "root",
    path: "api/report",
    index: void 0,
    caseSensitive: void 0,
    module: api_report_exports
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: app_index_exports
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route_exports
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: auth_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: route_exports2
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: app_exports
  }
};
export {
  assets_manifest_default as assets,
  assetsBuildDirectory,
  entry,
  future,
  mode,
  publicPath,
  routes
};
