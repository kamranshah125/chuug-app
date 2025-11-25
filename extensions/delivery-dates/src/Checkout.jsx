// import "@shopify/ui-extensions/checkout";
// // Register the extension
// export default extension("purchase.checkout.block.render", async (root, api) => {
//   const { storage, cart } = api;
  
//   // 1. Read shipping country from checkout
//   const shippingAddress = cart?.shippingAddress;
//   const countryCode = shippingAddress?.countryCode ?? "GB";

//   // 2. Call your backend for allocation
//   const response = await fetch(
//     "/api/next-despatch",
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ country: countryCode }),
//     }
//   );

//   const data = await response.json();
//   const allocation = data?.allocation;

//   if (!allocation) {
//     root.appendChild(
//       root.createComponent("Banner", { tone: "critical" }, [
//         "Unable to fetch delivery date.",
//       ])
//     );
//     return;
//   }

//   // 3. Save to cart attributes (so merchant sees in order details)
//   await cart.updateAttributes([
//     { key: "despatch_date", value: allocation.despatchDateISO },
//     { key: "delivery_date", value: allocation.deliveryDateISO },
//   ]);

//   // 4. UI shown to customer at checkout
//   root.appendChild(
//     root.createComponent("Banner", { tone: "success" }, [
//       `Estimated delivery: ${allocation.deliveryDateText}`,
//     ])
//   );
// });
// function extension(arg0, arg1) {
//   throw new Error("Function not implemented.");
// }
//Working................
// import '@shopify/ui-extensions/preact';
// import {render} from 'preact';
// import { useState, useEffect } from 'preact/hooks';


// export default async () => {
//   render(<DeliveryDateExtension />, document.body);
// };

// function DeliveryDateExtension() {
//   const [message, setMessage] = useState("Loading delivery date...");
//   const [status, setStatus] = useState("info");

//   useEffect(() => {
//     async function fetchDeliveryDate() {
//       try {
//         // NOTE: Replace this with actual checkout data if available
//         const countryCode = "GB"; // static fallback

//         const response = await fetch("/api/next-despatch", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ country: countryCode }),
//         });

//         const data = await response.json();
//         console.log("dataaaaaaaaaaa",data);

//         const allocation = data?.despatchDateISO;

//         if (!allocation) {
//           setStatus("critical");
//           setMessage("Unable to fetch delivery date.");
//           return;
//         }

//         // Update UI
//         setStatus("success");
//         setMessage(`Estimated delivery: ${allocation}`);

//         // TODO: Saving to cart attributes is not supported in 2025.10.x runtime
//         // You would need to handle it via your backend
//       } catch (err) {
//         setStatus("critical");
//         setMessage("Unexpected error fetching delivery date.");
//       }
//     }

//     fetchDeliveryDate();
//   }, []);

//   return (

//       <s-banner > Hello {status} {message}</s-banner>
   
//   );
// }
//current................
// import '@shopify/ui-extensions/preact';
// import { render } from 'preact';
// import { useState, useEffect } from 'preact/hooks';

// export default function extension() {
//   render(<DeliveryDateExtension />, document.body);
// }

// function DeliveryDateExtension() {
//   const [message, setMessage] = useState("Loading delivery date...");
//   const [status, setStatus] = useState("info");

//   useEffect(() => {
//     async function fetchDeliveryDate() {
//       try {
//         console.log("Starting API call...");
        
//         const response = await fetch(`https://pickup-willing-rebel-warranty.trycloudflare.com/api/next-despatch`);
        
//         console.log("Response status:", response.status);
//         console.log("Response ok:", response.ok);
        
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         console.log("API Response data:", data);

//         if (data && data.deliveryDateText) {
//           setMessage(`Estimated delivery: ${data.deliveryDateText}`);
//           setStatus("success");
//         } else {
//           setMessage("Delivery date not available");
//           setStatus("warning");
//         }

//       } catch (err) {
//         console.log("FULL ERROR:", err);
//         console.log("Error name:", err.name);
//         console.log("Error message:", err.message);
//         setMessage(`API Error: ${err.message}`);
//         setStatus("critical");
//       }
//     }

//     fetchDeliveryDate();
//   }, []);

//   return (
//     <s-banner> {status}
//       {/* Only use available properties */}
//       Shop: {shopify.shop.name} - {message}
//     </s-banner>
//   );
// }


import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export default async () => {
  render(<DeliveryDateExtension />, document.body);
};

function DeliveryDateExtension() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Fetching delivery date...");

  useEffect(() => {
    fetchDeliveryDate();
  }, []);

  const fetchDeliveryDate = async () => {
    try {
      console.log("Starting API call...");

      const response = await fetch(
        "https://none-topic-constitute-blah.trycloudflare.com/api/next-despatch"
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("API Response data:", data);

      if (data && data.deliveryDateText) {
        setMessage(`Estimated delivery: ${data.deliveryDateText}`);
        setStatus("success");
      } else {
        setMessage("Delivery date not available");
        setStatus("warning");
      }
    } catch (err) {
      console.error("ERROR:", err);
      setMessage(`API Error: ${err.message}`);
      setStatus("critical");
    }
  };

  // Render banner only when API is done loading
  if (status !== "loading") {
    return (
      <s-banner heading="Delivery Information">
        <s-text>{message}</s-text>
      </s-banner>
    );
  }

  return null;
}
