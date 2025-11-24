// app/routes/app.manageSettings.tsx
import React, { useEffect, useState } from "react";

type Settings = {
  shop?: string;
  timezone?: string;
  defaultDespatchLead?: number;
  defaultDeliveryLead?: number;
  countryOverrides?: any;
};

export default function ManageSettings() {
  const params = new URLSearchParams(location.search);
  const shop = params.get("shop") ?? "";

  const [timezone, setTimezone] = useState("Europe/London");
  const [despatchLead, setDespatchLead] = useState(1);
  const [deliveryLead, setDeliveryLead] = useState(2);
  const [countryOverrides, setCountryOverrides] = useState<any>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!shop) return;
    fetch(`/api/settings?shop=${encodeURIComponent(shop)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setTimezone(data.timezone ?? "Europe/London");
          setDespatchLead(data.defaultDespatchLead ?? 1);
          setDeliveryLead(data.defaultDeliveryLead ?? 2);
          setCountryOverrides(data.countryOverrides ?? {});
        }
      });
  }, [shop]);

  const save = async () => {
    if (!shop) return setMsg("❌ Shop required in query string");

    setMsg("Saving...");

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop,
        timezone,
        defaultDespatchLead: despatchLead,
        defaultDeliveryLead: deliveryLead,
        countryOverrides,
      }),
    });

    const j = await res.json();
    setMsg(j.ok ? "✅ Saved successfully" : "❌ Error saving settings");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Store Settings</h1>

      {/* Status Message */}
      {msg && (
        <div
          className={`mb-4 p-3 rounded-xl text-white ${
            msg.startsWith("✅")
              ? "bg-green-600"
              : msg.startsWith("❌")
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {msg}
        </div>
      )}

      {/* SHOP INFO */}
      <div className="p-4 bg-white shadow rounded-2xl mb-6">
        <h3 className="font-semibold mb-2 text-gray-700">Shop</h3>
        <div className="text-gray-600 p-2 rounded bg-gray-100 border">{shop || "No shop provided"}</div>
      </div>

      {/* GENERAL SETTINGS */}
      <div className="p-4 bg-white shadow rounded-2xl mb-6">
        <h3 className="font-semibold mb-4 text-gray-700">General Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Timezone */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Timezone</label>
            <input
              className="border p-2 rounded-md"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>

          {/* Despatch Lead */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Default Despatch Lead (days)</label>
            <input
              type="number"
              className="border p-2 rounded-md"
              value={despatchLead}
              onChange={(e) => setDespatchLead(Number(e.target.value))}
            />
          </div>

          {/* Delivery Lead */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Default Delivery Lead (days)</label>
            <input
              type="number"
              className="border p-2 rounded-md"
              value={deliveryLead}
              onChange={(e) => setDeliveryLead(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* COUNTRY OVERRIDES */}
      <div className="p-4 bg-white shadow rounded-2xl mb-6">
        <h3 className="font-semibold mb-4 text-gray-700">Country Overrides</h3>

        <textarea
          rows={8}
          className="border p-3 rounded-md w-full font-mono text-sm bg-gray-50"
          value={JSON.stringify(countryOverrides, null, 2)}
          onChange={(e) => {
            try {
              setCountryOverrides(JSON.parse(e.target.value));
            } catch {
              // ignore JSON parse error
            }
          }}
        />
        <p className="text-xs text-gray-500 mt-2">
          Enter JSON format. Example: <code>{`{"US": 2, "FR": 5}`}</code>
        </p>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={save}
        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 shadow"
      >
        Save Settings
      </button>
    </div>
  );
}
