// import { useEffect } from "react";
// import type {
//   ActionFunctionArgs,
//   HeadersFunction,
//   LoaderFunctionArgs,
// } from "react-router";
// import { useFetcher } from "react-router";
// import { useAppBridge } from "@shopify/app-bridge-react";
// import { authenticate } from "../shopify.server";
// import { boundary } from "@shopify/shopify-app-react-router/server";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   await authenticate.admin(request);

//   return null;
// };

// export const action = async ({ request }: ActionFunctionArgs) => {
//   const { admin } = await authenticate.admin(request);
//   const color = ["Red", "Orange", "Yellow", "Green"][
//     Math.floor(Math.random() * 4)
//   ];
//   const response = await admin.graphql(
//     `#graphql
//       mutation populateProduct($product: ProductCreateInput!) {
//         productCreate(product: $product) {
//           product {
//             id
//             title
//             handle
//             status
//             variants(first: 10) {
//               edges {
//                 node {
//                   id
//                   price
//                   barcode
//                   createdAt
//                 }
//               }
//             }
//           }
//         }
//       }`,
//     {
//       variables: {
//         product: {
//           title: `${color} Snowboard`,
//         },
//       },
//     },
//   );
//   const responseJson = await response.json();

//   const product = responseJson.data!.productCreate!.product!;
//   const variantId = product.variants.edges[0]!.node!.id!;

//   const variantResponse = await admin.graphql(
//     `#graphql
//     mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
//       productVariantsBulkUpdate(productId: $productId, variants: $variants) {
//         productVariants {
//           id
//           price
//           barcode
//           createdAt
//         }
//       }
//     }`,
//     {
//       variables: {
//         productId: product.id,
//         variants: [{ id: variantId, price: "100.00" }],
//       },
//     },
//   );

//   const variantResponseJson = await variantResponse.json();

//   return {
//     product: responseJson!.data!.productCreate!.product,
//     variant:
//       variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
//   };
// };

// export default function Index() {
//   const fetcher = useFetcher<typeof action>();

//   const shopify = useAppBridge();
//   const isLoading =
//     ["loading", "submitting"].includes(fetcher.state) &&
//     fetcher.formMethod === "POST";

//   useEffect(() => {
//     if (fetcher.data?.product?.id) {
//       shopify.toast.show("Product created");
//     }
//   }, [fetcher.data?.product?.id, shopify]);

//   const generateProduct = () => fetcher.submit({}, { method: "POST" });

//   return (
//     <s-page heading="Chuug Delivery Dates App">
//       {/* <s-button slot="primary-action" onClick={generateProduct}>
//         Generate a product
//       </s-button> */}

//       <s-section>
//         <s-paragraph>
//           Welcome to Chuug Delivery Dates Please go to  <s-link
//             href="/app/dashboard"
//           >dashboard</s-link>
          
//         </s-paragraph>
//       </s-section>
//       {/* <s-section heading="Get started with products">
//         <s-paragraph>
//           Generate a product with GraphQL and get the JSON output for that
//           product. Learn more about the{" "}
//           <s-link
//             href="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
//             target="_blank"
//           >
//             productCreate
//           </s-link>{" "}
//           mutation in our API references.
//         </s-paragraph>
//         <s-stack direction="inline" gap="base">
//           <s-button
//             onClick={generateProduct}
//             {...(isLoading ? { loading: true } : {})}
//           >
//             Generate a product
//           </s-button>
//           {fetcher.data?.product && (
//             <s-button
//               onClick={() => {
//                 shopify.intents.invoke?.("edit:shopify/Product", {
//                   value: fetcher.data?.product?.id,
//                 });
//               }}
//               target="_blank"
//               variant="tertiary"
//             >
//               Edit product
//             </s-button>
//           )}
//         </s-stack>
//         {fetcher.data?.product && (
//           <s-section heading="productCreate mutation">
//             <s-stack direction="block" gap="base">
//               <s-box
//                 padding="base"
//                 borderWidth="base"
//                 borderRadius="base"
//                 background="subdued"
//               >
//                 <pre style={{ margin: 0 }}>
//                   <code>{JSON.stringify(fetcher.data.product, null, 2)}</code>
//                 </pre>
//               </s-box>

//               <s-heading>productVariantsBulkUpdate mutation</s-heading>
//               <s-box
//                 padding="base"
//                 borderWidth="base"
//                 borderRadius="base"
//                 background="subdued"
//               >
//                 <pre style={{ margin: 0 }}>
//                   <code>{JSON.stringify(fetcher.data.variant, null, 2)}</code>
//                 </pre>
//               </s-box>
//             </s-stack>
//           </s-section>
//         )}
//       </s-section>

//       <s-section slot="aside" heading="App template specs">
//         <s-paragraph>
//           <s-text>Framework: </s-text>
//           <s-link href="https://reactrouter.com/" target="_blank">
//             React Router
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>Interface: </s-text>
//           <s-link
//             href="https://shopify.dev/docs/api/app-home/using-polaris-components"
//             target="_blank"
//           >
//             Polaris web components
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>API: </s-text>
//           <s-link
//             href="https://shopify.dev/docs/api/admin-graphql"
//             target="_blank"
//           >
//             GraphQL
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>Database: </s-text>
//           <s-link href="https://www.prisma.io/" target="_blank">
//             Prisma
//           </s-link>
//         </s-paragraph>
//       </s-section>

//       <s-section slot="aside" heading="Next steps">
//         <s-unordered-list>
//           <s-list-item>
//             Build an{" "}
//             <s-link
//               href="https://shopify.dev/docs/apps/getting-started/build-app-example"
//               target="_blank"
//             >
//               example app
//             </s-link>
//           </s-list-item>
//           <s-list-item>
//             Explore Shopify&apos;s API with{" "}
//             <s-link
//               href="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
//               target="_blank"
//             >
//               GraphiQL
//             </s-link>
//           </s-list-item>
//         </s-unordered-list>
//       </s-section> */}
//     </s-page>
//   );
// }

// export const headers: HeadersFunction = (headersArgs) => {
//   return boundary.headers(headersArgs);
// };
import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type CapacityData = {
  date: string;
  totalCapacity: number;
  usedCapacity: number;
};

export const loader = async ({ request }: { request: Request }) => {
  await authenticate.admin(request);
  return null;
};

export default function DashboardPage() {
  const backend = "/api/report";
  const shopify = useAppBridge();

  const [data, setData] = useState<CapacityData[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  // const fetchReport = async () => {
  //   try {
  //     setLoading(true);
  //     const params: Record<string, string> = {};
  //     if (fromDate) params.startDate = fromDate;
  //     if (toDate) params.endDate = toDate;

  //     const res = await axios.get(backend, { params });
  //     setData(res.data.data || []);
  //   } catch (error) {
  //     console.error("Error fetching report:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchReport = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;

      const res = await axios.get(backend, { params });

      // Map the API response to match your frontend data structure
      const mappedData = (res.data.report || []).map((item: any) => ({
        date: item.date,
        totalCapacity: item.total, // map 'total' to 'totalCapacity'
        usedCapacity: item.used, // map 'used' to 'usedCapacity'
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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }),
  datasets: [
    {
      label: "Total Capacity",
      data: data.map((d) => d.totalCapacity),
      borderColor: "rgba(59,130,246,1)",
      backgroundColor: "rgba(59,130,246,0.2)",
      tension: 0.3,
      fill: true,
    },
    {
      label: "Used Capacity",
      data: data.map((d) => d.usedCapacity),
      borderColor: "rgba(239,68,68,1)",
      backgroundColor: "rgba(239,68,68,0.2)",
      tension: 0.3,
      fill: true,
    },
  ],
};

 const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false, // This is crucial!
  plugins: {
    legend: { 
      position: 'top' as const,
      display: true
    },
    title: { 
      display: true, 
      text: 'Capacity Overview' 
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Capacity'
      },
      beginAtZero: true
    }
  }
};

  return (
    <s-page heading="Dashboard">
      <s-section heading="Capacity Overview">
        <s-box padding="base" background="subdued">
          <div className="flex gap-3 mb-4">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border p-2 rounded-md"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border p-2 rounded-md"
            />
            <s-button onClick={fetchReport}>Apply Filter</s-button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <s-card>
              <s-text>Total</s-text>
              <s-text>{totalCapacities}</s-text>
            </s-card>
            <s-card>
              <s-text>Used</s-text>
              <s-text>{usedCapacities}</s-text>
            </s-card>
            <s-card>
              <s-text>Remaining</s-text>
              <s-text>{remainingCapacities}</s-text>
            </s-card>
          </div>

          {loading ? (
            <s-text>Loading report...</s-text>
          ) : data.length > 0 ? (
            <div style={{ height: "400px", width: "100%" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <s-text>No data available for selected range.</s-text>
          )}
        </s-box>
      </s-section>
    </s-page>
  );
}