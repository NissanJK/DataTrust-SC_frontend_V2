import React, { useEffect, useState } from "react";
import API from "../api/api";

export default function DataRequester() {
  const [role, setRole] = useState("");
  const [attribute, setAttribute] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fixed attribute options (ABAC compatible)
  const attributeOptions = [
    "sensitivity=public",
    "sensitivity=private"
  ];

  useEffect(() => {
    let intervalId;
    // FIXED: Error handling for category fetch
    const fetchCategories = async () => {
      try {
        const res = await API.get("/dataset");
        const unique = [
          ...new Set(res.data.map(d => d.metadata.Data_Category))
        ].filter(Boolean); // FIXED: Filter out null/undefined
        setCategories(unique);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
    intervalId = setInterval(fetchCategories, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const requestAccess = async () => {
    setResult("");
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/access/request", {
        category,
        role,
        attribute
      });

      // FIXED: Better result formatting
      if (res.data.records && res.data.records.length > 0) {
        const formattedRecords = res.data.records
          .map((r, idx) => `Record ${idx + 1}:\n${r.data}`)
          .join("\n\n" + "=".repeat(50) + "\n\n");
        
        setResult(`✅ Access Granted!\n\nTotal Records: ${res.data.count}\n\n${"=".repeat(50)}\n\n${formattedRecords}`);
      } else {
        setResult("No records returned");
      }

    } catch (err) {
      // FIXED: Better error messages
      const errorMsg = err.response?.data?.message || "Access request failed";
      setError(`❌ ${errorMsg}`);
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Data Requester</h3>

      {/* ROLE */}
      <select 
        value={role}
        onChange={e => setRole(e.target.value)}
      >
        <option value="">Select Role</option>
        <option value="Citizen">Citizen</option>
        <option value="CityAuthority">CityAuthority</option>
        <option value="Researcher">Researcher</option>
      </select>

      {/* ATTRIBUTE DROPDOWN */}
      <select 
        value={attribute}
        onChange={e => setAttribute(e.target.value)}
      >
        <option value="">Select Attribute</option>
        {attributeOptions.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      {/* CATEGORY */}
      <select 
        value={category}
        onChange={e => setCategory(e.target.value)}
      >
        <option value="">Select Category</option>
        {categories.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <button
        onClick={requestAccess}
        disabled={!role || !attribute || !category || loading}
      >
        {loading ? "Requesting..." : "Request Access"}
      </button>

      {/* FIXED: Show error separately */}
      {error && <div className="error" style={{ marginTop: "10px" }}>{error}</div>}

      {/* Result display */}
      {result && (
        <div
          style={{
            marginTop: "10px",
            maxHeight: "300px",
            overflowY: "auto",
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            whiteSpace: "pre-wrap",
            fontSize: "12px"
          }}
        >
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
