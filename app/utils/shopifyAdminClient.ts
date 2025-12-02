// app/utils/shopifyAdminClient.ts
export function makeAdminClient(shop: string, accessToken: string) {
  const base = `https://${shop}/admin/api/2025-07/graphql.json`; // choose appropriate API version
  return {
    async graphql(query: string, variables?: any) {
      const res = await fetch(base, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables }),
      });
      return res.json();
    },
  };
}
