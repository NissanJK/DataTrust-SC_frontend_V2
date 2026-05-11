import React, { useState } from "react";
import API from "../api/api";

export default function DataOwnerUpload() {
  const [form, setForm] = useState({
    ownerRole: "",
    Sector: "",
    Data_Provider_Type: "",
    Data_Category: "",
    Temperature_C: "",
    Air_Quality_Index: "",
    Traffic_Density: "",
    Energy_Consumption_kWh: "",
    policy: ""
  });
  const [customPolicy, setCustomPolicy] = useState("");
  const [useCustomPolicy, setUseCustomPolicy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // FIXED: Predefined policies
  const predefinedPolicies = [
    {
      label: "Public Access (All Roles)",
      value: "role:Citizen OR role:CityAuthority OR role:Researcher AND attribute:sensitivity=public"
    },
    {
      label: "Authority & Researcher (Private)",
      value: "role:CityAuthority OR role:Researcher AND attribute:sensitivity=private"
    },
    {
      label: "Authority & Citizen (Public)",
      value: "role:CityAuthority OR role:Citizen AND attribute:sensitivity=public"
    }
  ];

  const isNumber = (value) =>
    value !== "" && !isNaN(value) && isFinite(value);

  const validate = () => {
    if (!form.ownerRole) return "Owner role is required";
    if (!form.Sector) return "Sector is required";
    if (!form.Data_Provider_Type) return "Provider type is required";
    if (!form.Data_Category) return "Data category is required";
    
    // Check policy
    const finalPolicy = useCustomPolicy ? customPolicy : form.policy;
    if (!finalPolicy) return "Access policy is required";

    // Optional number validation
    if (form.Temperature_C && !isNumber(form.Temperature_C))
      return "Temperature must be a valid number";
    if (form.Air_Quality_Index && !isNumber(form.Air_Quality_Index))
      return "AQI must be a valid number";
    if (form.Traffic_Density && !isNumber(form.Traffic_Density))
      return "Traffic Density must be a valid number";
    if (form.Energy_Consumption_kWh && !isNumber(form.Energy_Consumption_kWh))
      return "Energy Consumption must be a valid number";

    return null;
  };

  const submit = async () => {
    setError("");
    setStatus("");
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setStatus("Encrypting & uploading...");

    try {
      const finalPolicy = useCustomPolicy ? customPolicy : form.policy;
      
      const response = await API.post("/dataset/upload", {
        ...form,
        Temperature_C: form.Temperature_C ? Number(form.Temperature_C) : null,
        Air_Quality_Index: form.Air_Quality_Index ? Number(form.Air_Quality_Index) : null,
        Traffic_Density: form.Traffic_Density ? Number(form.Traffic_Density) : null,
        Energy_Consumption_kWh: form.Energy_Consumption_kWh ? Number(form.Energy_Consumption_kWh) : null,
        policy: finalPolicy
      });

      setStatus(`✅ Upload successful! Hash: ${response.data.hash?.substring(0, 16)}...`);
      
      // Reset form
      setForm({
        ownerRole: "",
        Sector: "",
        Data_Provider_Type: "",
        Data_Category: "",
        Temperature_C: "",
        Air_Quality_Index: "",
        Traffic_Density: "",
        Energy_Consumption_kWh: "",
        policy: ""
      });
      setCustomPolicy("");
      setUseCustomPolicy(false);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Upload failed. Please try again.";
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card upload-card">
      <h3>📤 Data Owner Upload</h3>

      {/* Owner Role */}
      <div className="form-group">
        <label>Owner Role *</label>
        <select
          value={form.ownerRole}
          onChange={(e) => setForm({ ...form, ownerRole: e.target.value })}
        >
          <option value="" disabled>Select Owner Role</option>
          <option value="Citizen">👤 Citizen</option>
          <option value="CityAuthority">🏛️ City Authority</option>
          <option value="Researcher">🔬 Researcher</option>
        </select>
      </div>

      {/* FIXED: Sector Dropdown */}
      <div className="form-group">
        <label>Sector *</label>
        <select
          value={form.Sector}
          onChange={(e) => setForm({ ...form, Sector: e.target.value })}
        >
          <option value="" disabled>Select Sector</option>
          <option value="sector1">📍 Sector 1</option>
          <option value="sector2">📍 Sector 2</option>
          <option value="sector3">📍 Sector 3</option>
          <option value="sector4">📍 Sector 4</option>
          <option value="sector5">📍 Sector 5</option>
        </select>
      </div>

      {/* Provider Type */}
      <div className="form-group">
        <label>Provider Type *</label>
        <input
          placeholder="e.g., IoT Sensor, Traffic Camera, Public Agency"
          value={form.Data_Provider_Type}
          onChange={(e) => setForm({ ...form, Data_Provider_Type: e.target.value })}
        />
      </div>

      {/* Category */}
      <div className="form-group">
        <label>Category *</label>
        <input
          placeholder="e.g., Environmental, Traffic, Utility, Citizen Service"
          value={form.Data_Category}
          onChange={(e) => setForm({ ...form, Data_Category: e.target.value })}
        />
      </div>

      {/* Sensor Data Fields */}
      <div className="sensor-data-group">
        <h4>📊 Sensor Data (Optional)</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g., 25.5"
              value={form.Temperature_C}
              onChange={(e) => setForm({ ...form, Temperature_C: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Air Quality Index</label>
            <input
              type="number"
              step="1"
              placeholder="e.g., 150"
              value={form.Air_Quality_Index}
              onChange={(e) => setForm({ ...form, Air_Quality_Index: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Traffic Density</label>
            <input
              type="number"
              step="1"
              placeholder="e.g., 45"
              value={form.Traffic_Density}
              onChange={(e) => setForm({ ...form, Traffic_Density: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Energy Consumption (kWh)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g., 320.5"
              value={form.Energy_Consumption_kWh}
              onChange={(e) => setForm({ ...form, Energy_Consumption_kWh: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* FIXED: Access Policy with Dropdown + Custom Option */}
      <div className="form-group">
        <label>Access Policy *</label>
        
        <div className="policy-toggle">
          <label className="toggle-option">
            <input
              type="radio"
              checked={!useCustomPolicy}
              onChange={() => setUseCustomPolicy(false)}
            />
            <span>Use Predefined Policy</span>
          </label>
          <label className="toggle-option">
            <input
              type="radio"
              checked={useCustomPolicy}
              onChange={() => setUseCustomPolicy(true)}
            />
            <span>Custom Policy</span>
          </label>
        </div>

        {!useCustomPolicy ? (
          <select
            value={form.policy}
            onChange={(e) => setForm({ ...form, policy: e.target.value })}
          >
            <option value="" disabled>Select Access Policy</option>
            {predefinedPolicies.map((p, idx) => (
              <option key={idx} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        ) : (
          <textarea
            placeholder="Enter custom policy (e.g., role:CityAuthority OR role:Researcher AND attribute:sensitivity=private)"
            value={customPolicy}
            onChange={(e) => setCustomPolicy(e.target.value)}
            rows={3}
            className="policy-textarea"
          />
        )}
      </div>

      <button onClick={submit} disabled={loading} className="submit-btn">
        {loading ? "⏳ Uploading..." : "📤 Upload Data"}
      </button>

      {error && <div className="error">{error}</div>}
      {status && <div className="status">{status}</div>}
    </div>
  );
}
