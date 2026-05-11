import React, { useEffect, useState, useCallback } from "react";
import API from "../api/api";
import "./DisasterCenter.css";

export default function DisasterCenter() {
  const [alerts, setAlerts] = useState([]);
  const [sectorStats, setSectorStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedSector, setSelectedSector] = useState("ALL");

  // FIXED: Deduplicate alerts - only show latest alert of each type per sector
  const deduplicateAlerts = useCallback((alertsList) => {
    const alertMap = new Map();
    
    alertsList.forEach(alert => {
      // Create unique key: sector + type + metric
      const key = `${alert.sector}-${alert.type}-${alert.metric}`;
      
      // Keep only the most recent alert for this key
      if (!alertMap.has(key) || new Date(alert.timestamp) > new Date(alertMap.get(key).timestamp)) {
        alertMap.set(key, alert);
      }
    });
    
    // Convert back to array and sort by severity
    return Array.from(alertMap.values()).sort((a, b) => {
      const severityOrder = { CRITICAL: 0, WARNING: 1, CAUTION: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, []);

  const fetchDisasterData = useCallback(async () => {
    try {
      const res = await API.get("/disaster/alerts");
      
      // Deduplicate alerts - keep only the latest of each type per sector
      const uniqueAlerts = deduplicateAlerts(res.data.alerts || []);
      
      setAlerts(uniqueAlerts);
      setSectorStats(res.data.sectorStats || {});
      setError("");
    } catch (err) {
      console.error("Failed to fetch disaster data:", err);
      setError("Failed to load disaster monitoring data");
    } finally {
      setLoading(false);
    }
  }, [deduplicateAlerts]);

  useEffect(() => {
    fetchDisasterData();
    const interval = setInterval(fetchDisasterData, 5000);
    return () => clearInterval(interval);
  }, [fetchDisasterData]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "CRITICAL": return "#dc3545";
      case "WARNING": return "#fd7e14";
      case "CAUTION": return "#ffc107";
      default: return "#6c757d";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "CRITICAL": return "🚨";
      case "WARNING": return "⚠️";
      case "CAUTION": return "⚡";
      default: return "ℹ️";
    }
  };

  const getStatusColor = (alertCount, criticalCount) => {
    if (criticalCount > 0) return "#dc3545";
    if (alertCount > 2) return "#fd7e14";
    if (alertCount > 0) return "#ffc107";
    return "#28a745";
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== "ALL" && alert.severity !== filter) return false;
    if (selectedSector !== "ALL" && alert.sector !== selectedSector) return false;
    return true;
  });

  const totalCritical = alerts.filter(a => a.severity === "CRITICAL").length;
  const totalWarning = alerts.filter(a => a.severity === "WARNING").length;
  const totalCaution = alerts.filter(a => a.severity === "CAUTION").length;

  if (loading) {
    return (
      <div className="disaster-center">
        <div className="loading">
          <div className="spinner"></div>
          Loading disaster monitoring system...
        </div>
      </div>
    );
  }

  return (
    <div className="disaster-center">
      <div className="disaster-header">
        <h2>🚨 Disaster Warning & Aid Center</h2>
        <p className="subtitle">Real-time monitoring across all city sectors</p>
        <div className="live-indicator">
          <span className="pulse"></span>
          LIVE
        </div>
      </div>

      {/* Overall Status */}
      <div className="status-overview">
        <div className="status-card critical">
          <div className="status-icon">🚨</div>
          <div className="status-number">{totalCritical}</div>
          <div className="status-label">Critical Alerts</div>
        </div>
        <div className="status-card warning">
          <div className="status-icon">⚠️</div>
          <div className="status-number">{totalWarning}</div>
          <div className="status-label">Warnings</div>
        </div>
        <div className="status-card caution">
          <div className="status-icon">⚡</div>
          <div className="status-number">{totalCaution}</div>
          <div className="status-label">Cautions</div>
        </div>
        <div className="status-card total">
          <div className="status-icon">📊</div>
          <div className="status-number">{alerts.length}</div>
          <div className="status-label">Active Alerts</div>
        </div>
      </div>

      {/* Sector Status Grid */}
      <div className="sector-grid">
        <h3>Sector Status Monitor</h3>
        <div className="sectors">
          {["sector1", "sector2", "sector3", "sector4", "sector5"].map(sector => {
            const stats = sectorStats[sector] || { alerts: 0, critical: 0 };
            const statusColor = getStatusColor(stats.alerts, stats.critical);
            
            return (
              <div 
                key={sector}
                className={`sector-card ${selectedSector === sector ? 'selected' : ''}`}
                style={{ borderColor: statusColor }}
                onClick={() => setSelectedSector(selectedSector === sector ? "ALL" : sector)}
              >
                <div className="sector-icon">📍</div>
                <div className="sector-name">{sector.toUpperCase()}</div>
                <div className="sector-status" style={{ color: statusColor }}>
                  {stats.critical > 0 ? "🚨 CRITICAL" : 
                   stats.alerts > 2 ? "⚠️ WARNING" : 
                   stats.alerts > 0 ? "⚡ CAUTION" : "✅ NORMAL"}
                </div>
                <div className="sector-alerts">
                  {stats.alerts} alert{stats.alerts !== 1 ? 's' : ''}
                  {stats.critical > 0 && ` (${stats.critical} critical)`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>🔍 Filter by Severity:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All Alerts</option>
            <option value="CRITICAL">🚨 Critical Only</option>
            <option value="WARNING">⚠️ Warnings Only</option>
            <option value="CAUTION">⚡ Cautions Only</option>
          </select>
        </div>
        <div className="filter-group">
          <label>📍 Filter by Sector:</label>
          <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
            <option value="ALL">All Sectors</option>
            <option value="sector1">Sector 1</option>
            <option value="sector2">Sector 2</option>
            <option value="sector3">Sector 3</option>
            <option value="sector4">Sector 4</option>
            <option value="sector5">Sector 5</option>
          </select>
        </div>
      </div>

      {/* FIXED: Alerts List with Scrollbar */}
      <div className="alerts-container">
        <h3>Active Alerts ({filteredAlerts.length})</h3>
        
        {error && <div className="error">{error}</div>}

        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <div className="no-alerts-icon">✅</div>
            <h4>All Clear!</h4>
            <p>All sectors are operating within normal parameters</p>
          </div>
        ) : (
          <div className="alerts-list-scrollable">
            {filteredAlerts.map((alert, index) => (
              <div 
                key={`${alert.sector}-${alert.type}-${index}`}
                className="alert-item"
                style={{ borderLeftColor: getSeverityColor(alert.severity) }}
              >
                <div className="alert-header">
                  <div className="alert-title">
                    <span className="severity-badge" style={{ 
                      backgroundColor: getSeverityColor(alert.severity),
                      color: '#fff'
                    }}>
                      {getSeverityIcon(alert.severity)} {alert.severity}
                    </span>
                    <span className="alert-sector">{alert.sector}</span>
                  </div>
                  <div className="alert-time">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="alert-message">{alert.message}</div>

                <div className="alert-details">
                  <strong>📊 Metric:</strong> {alert.metric} = {alert.value}
                </div>

                <div className="alert-recommendation">
                  <strong>📋 Public Recommendation:</strong>
                  <p>{alert.recommendation}</p>
                </div>

                {alert.actions && alert.actions.length > 0 && (
                  <div className="alert-actions">
                    <strong>🚑 Emergency Actions Required:</strong>
                    <ul>
                      {alert.actions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}