// app/routes/app.manageSettings.tsx
import React, { useEffect, useState } from "react";

type Settings = {
  timezone?: string;
  defaultDespatchLead?: number;
  defaultDeliveryLead?: number;
  countryOverrides?: any;
};

export default function ManageSettings() {
  const [timezone, setTimezone] = useState("Europe/London");
  const [despatchLead, setDespatchLead] = useState(1);
  const [deliveryLead, setDeliveryLead] = useState(2);
  const [countryOverrides, setCountryOverrides] = useState<any>({});
  const [msg, setMsg] = useState("");

  // Fetch existing settings
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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

      {/* GENERAL SETTINGS */}
      <div className="p-4 bg-white shadow rounded-2xl mb-6">
        <h3 className="font-semibold mb-4 text-gray-700">General Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Timezone</label>
            <input
              className="border p-2 rounded-md"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Default Despatch Lead (days)</label>
            <input
              type="number"
              className="border p-2 rounded-md"
              value={despatchLead}
              onChange={(e) => setDespatchLead(Number(e.target.value))}
            />
          </div>

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

  {Object.entries(countryOverrides).map(([country, leads]: any) => (
    <div key={country} className="grid grid-cols-4 gap-2 items-end mb-3">
      
      {/* Country Code */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Country</label>
        <input
          className="border p-2 rounded-md w-full text-center"
          value={country}
          onChange={(e) => {
            const newOverrides = { ...countryOverrides };
            newOverrides[e.target.value] = leads;
            if (e.target.value !== country) delete newOverrides[country];
            setCountryOverrides(newOverrides);
          }}
          placeholder="Country code"
        />
      </div>

      {/* Despatch Lead */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Despatch Lead (days)</label>
        <input
          type="number"
          className="border p-2 rounded-md w-full"
          value={leads.despatchLead}
          onChange={(e) => {
            const newOverrides = { ...countryOverrides };
            newOverrides[country] = { ...leads, despatchLead: Number(e.target.value) };
            setCountryOverrides(newOverrides);
          }}
        />
      </div>

      {/* Delivery Lead */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Delivery Lead (days)</label>
        <input
          type="number"
          className="border p-2 rounded-md w-full"
          value={leads.deliveryLead}
          onChange={(e) => {
            const newOverrides = { ...countryOverrides };
            newOverrides[country] = { ...leads, deliveryLead: Number(e.target.value) };
            setCountryOverrides(newOverrides);
          }}
        />
      </div>

      {/* Remove Button */}
      <div className="flex flex-col">
        <button
          className="bg-red-500 text-white px-2 py-1 rounded mt-5"
          onClick={() => {
            const newOverrides = { ...countryOverrides };
            delete newOverrides[country];
            setCountryOverrides(newOverrides);
          }}
        >
          Remove
        </button>
      </div>
    </div>
  ))}

  {/* Add New Country */}
  <button
    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    onClick={() => {
      const newOverrides = { ...countryOverrides };
      let newKey = "NEW";
      let counter = 1;
      // ensure unique key
      while (newOverrides[newKey]) {
        newKey = `NEW${counter++}`;
      }
      newOverrides[newKey] = { despatchLead: 1, deliveryLead: 1 };
      setCountryOverrides(newOverrides);
    }}
  >
    Add Country
  </button>
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
