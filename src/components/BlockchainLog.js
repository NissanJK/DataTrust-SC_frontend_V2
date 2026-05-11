import React, { useEffect, useState } from "react";
import API from "../api/api";

/**
 * BlockchainLog.js (updated)
 * ─────────────────────────────────────────────────────────────
 * Changes from original:
 *   1. Log entries now display contractId (from smart contract additions).
 *   2. New "Verify Chain" button calls GET /api/system/verify-chain
 *      and shows the result inline — so users can confirm the
 *      audit log hasn't been tampered with, without leaving the UI.
 *   3. Chain-verification state (verifying, result) added.
 *   4. formatLog() updated to include contractId when present.
 */
export default function BlockchainLog() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL"); // ALL, DATA_REGISTER, ACCESS_REQUEST

    // ── Chain verification state ───────────────────────────────
    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState(null); // { valid, message, totalEntries, brokenAt }

    // ── Fetch logs (unchanged) ─────────────────────────────────
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await API.get("/access/logs");
                setLogs(res.data);
                setError("");
            } catch (err) {
                console.error("Failed to fetch logs:", err);
                setError("Failed to load logs");
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, []);

    // ── Chain verification ─────────────────────────────────────
    const verifyChain = async () => {
        setVerifying(true);
        setVerifyResult(null);
        try {
            const res = await API.get("/system/verify-chain");
            setVerifyResult(res.data);
        } catch (err) {
            // 409 Conflict is returned when chain is broken — still a valid response
            if (err.response?.data) {
                setVerifyResult(err.response.data);
            } else {
                setVerifyResult({
                    valid: false,
                    message: "Verification request failed. Check server connection."
                });
            }
        } finally {
            setVerifying(false);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    // ── Log formatter — now includes contractId ────────────────
    const formatLog = (log) => {
        const parts = [];

        parts.push(`[${formatDate(log.timestamp)}]`);

        if (log.type === "DATA_REGISTER") {
            parts.push("📝 DATA_REGISTER");
        } else {
            parts.push("🔐 ACCESS_REQUEST");
        }

        parts.push(`Hash: ${log.hash?.substring(0, 16)}...`);

        if (log.owner)     parts.push(`Owner: ${log.owner}`);
        if (log.role)      parts.push(`Role: ${log.role}`);
        if (log.attribute) parts.push(`Attribute: ${log.attribute}`);

        if (log.policy && log.type === "DATA_REGISTER") {
            parts.push(`Policy: ${log.policy}`);
        }

        if (log.granted !== undefined) {
            parts.push(`Granted: ${log.granted ? "✅ YES" : "❌ NO"}`);
        }

        // New: show contract ID if present
        if (log.contractId) {
            parts.push(`Contract: ${log.contractId.substring(0, 12)}...`);
        }

        // New: show chain index
        if (log.chainIndex !== undefined) {
            parts.push(`#${log.chainIndex}`);
        }

        return parts.join(" | ");
    };

    const filteredLogs = logs.filter(log => {
        if (filter === "ALL") return true;
        return log.type === filter;
    });

    return (
        <div className="card blockchain-card">
            <div className="blockchain-header">
                <h3>⛓️ Blockchain Audit Log</h3>
                <div className="log-stats">
                    <span className="stat-badge">{logs.length} Total Logs</span>
                </div>
            </div>

            {/* Filter */}
            <div className="log-filter">
                <label>Filter by Type:</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="ALL">All Logs</option>
                    <option value="DATA_REGISTER">📝 Data Registrations</option>
                    <option value="ACCESS_REQUEST">🔐 Access Requests</option>
                </select>
            </div>

            {/* ── Verify Chain button ───────────────────────────── */}
            <div style={{ margin: "8px 0" }}>
                <button
                    onClick={verifyChain}
                    disabled={verifying}
                    style={{
                        background: verifyResult === null
                            ? "#667eea"
                            : verifyResult.valid ? "#28a745" : "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 14px",
                        cursor: verifying ? "not-allowed" : "pointer",
                        fontWeight: "bold"
                    }}
                >
                    {verifying ? "🔍 Verifying..." : "🔍 Verify Chain Integrity"}
                </button>

                {verifyResult && (
                    <div style={{
                        marginTop: "6px",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        background: verifyResult.valid ? "#d4edda" : "#f8d7da",
                        color: verifyResult.valid ? "#155724" : "#721c24",
                        border: `1px solid ${verifyResult.valid ? "#c3e6cb" : "#f5c6cb"}`
                    }}>
                        {verifyResult.valid ? "✅" : "❌"} {verifyResult.message}
                        {verifyResult.totalEntries !== undefined && (
                            <span style={{ marginLeft: "8px", opacity: 0.8 }}>
                                ({verifyResult.totalEntries} entries checked)
                            </span>
                        )}
                        {!verifyResult.valid && verifyResult.brokenAt !== undefined && (
                            <span style={{ marginLeft: "8px" }}>
                                — broken at chain index {verifyResult.brokenAt}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {error && <div className="error">{error}</div>}

            {/* Scrollable log container */}
            <div className="log-container">
                {filteredLogs.length === 0 ? (
                    <div className="no-logs">
                        No logs available yet
                    </div>
                ) : (
                    filteredLogs.map((l, i) => (
                        <div
                            key={i}
                            className={`log-entry ${l.type.toLowerCase()}`}
                        >
                            <div className="log-content">
                                {formatLog(l)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}