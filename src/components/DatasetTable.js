import React, { useEffect, useState } from "react";
import API from "../api/api";

export default function DatasetTable() {
    const [data, setData] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get("/dataset");
                setData(res.data);
                setError("");
            } catch (err) {
                console.error("Failed to fetch dataset:", err);
                setError("Failed to load dataset");
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const downloadCSV = async () => {
        setLoading(true);
        try {
            const res = await API.get("/dataset/export");
            const blob = new Blob([res.data], { type: "text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `DataTrust-SC_dataset_${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch (err) {
            console.error("Download failed:", err);
            setError("Failed to download CSV");
        } finally {
            setLoading(false);
        }
    };

    const displayValue = (value) => {
        return value !== null && value !== undefined ? value : '-';
    };

    return (
        <div className="card dataset-card">
            <div className="dataset-header">
                <h3>📊 Smart City Dataset ({data.length} records)</h3>
                <button onClick={downloadCSV} disabled={loading} className="download-btn">
                    {loading ? "⏳ Downloading..." : "📥 Download CSV"}
                </button>
            </div>

            {error && <div className="error" style={{ marginTop: "10px" }}>{error}</div>}

            {/* FIXED: Scrollable table container */}
            <div className="table-container-scrollable">
                <table className="dataset-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Timestamp</th>
                            <th>Data Owner</th>
                            <th>Sector</th>
                            <th>Provider</th>
                            <th>Category</th>
                            <th>Temp (°C)</th>
                            <th>AQI</th>
                            <th>Traffic</th>
                            <th>Energy (kWh)</th>
                            <th>TX Cost (Gas)</th>
                            <th>Auth Latency (s)</th>
                            <th>Hash</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="13" style={{ textAlign: "center", color: "#888", padding: "40px" }}>
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((d, i) => (
                                <tr key={d._id || i} className="table-row">
                                    <td>{i + 1}</td>
                                    <td>{formatDate(d.createdAt)}</td>
                                    <td>{displayValue(d.metadata?.ownerRole||d.metadata?.Data_Owner)}</td>
                                    <td>
                                        <span className="sector-badge">
                                            {displayValue(d.metadata?.Sector)}
                                        </span>
                                    </td>
                                    <td>{displayValue(d.metadata?.Data_Provider_Type)}</td>
                                    <td>{displayValue(d.metadata?.Data_Category)}</td>
                                    <td>{displayValue(d.metadata?.Temperature_C)}</td>
                                    <td>{displayValue(d.metadata?.Air_Quality_Index)}</td>
                                    <td>{displayValue(d.metadata?.Traffic_Density)}</td>
                                    <td>{displayValue(d.metadata?.Energy_Consumption_kWh)}</td>
                                    <td>{displayValue(d.metadata?.Blockchain_Tx_Cost_Gas)}</td>
                                    <td>{displayValue(d.metadata?.Authorization_Latency_sec)}</td>
                                    <td className="hash-cell">
                                        <span title={d.hash}>
                                            {d.hash?.substring(0, 12)}...
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
