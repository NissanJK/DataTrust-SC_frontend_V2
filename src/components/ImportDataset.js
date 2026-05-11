import React, { useState, useRef } from "react"; // CHANGE 1: added useRef
import API from "../api/api";

export default function ImportDataset() {
  const [file, setFile]       = useState(null);
  const [status, setStatus]   = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null); // CHANGE 2: ref declared here

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Please select a CSV file");
        setFile(null);
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError("");
      setStatus("");
    }
  };

  const importCSV = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setStatus("Importing dataset...");
    setError("");

    try {
      const res = await API.post("/dataset/import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const { imported, errors, total } = res.data;
      setStatus(
        `✅ Import complete!\nImported: ${imported}/${total} records${errors > 0 ? `\nErrors: ${errors}` : ""}`
      );
      setFile(null);

      // CHANGE 3: reset via ref instead of document.querySelector
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Import failed";
      setError(`❌ ${errorMsg}`);
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Import Dataset</h3>

      {/* CHANGE 2: ref attached to the input element */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={loading}
      />

      {file && (
        <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
          Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </div>
      )}

      <button onClick={importCSV} disabled={!file || loading}>
        {loading ? "Importing..." : "Import Dataset"}
      </button>

      {error  && <div className="error"  style={{ whiteSpace: "pre-wrap" }}>{error}</div>}
      {status && <div className="status" style={{ whiteSpace: "pre-wrap" }}>{status}</div>}
    </div>
  );
}