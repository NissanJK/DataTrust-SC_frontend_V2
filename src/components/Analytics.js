import React, { useEffect, useState, useCallback } from "react";
import API from "../api/api";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from "recharts";
import "./Analytics.css";

export default function Analytics() {
  const [data, setData]       = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  // FIX 1: calculateStats wrapped in useCallback so it is a stable
  // reference and can safely be listed in fetchData's dep array.
  const calculateStats = useCallback((datasets) => {
    if (datasets.length === 0) {
      setStats(null);
      return;
    }

    const gasCosts = datasets
      .map(d => d.metadata.Blockchain_Tx_Cost_Gas)
      .filter(g => g !== null && g !== undefined && !isNaN(g));

    const latencies = datasets
      .map(d => d.metadata.Authorization_Latency_sec)
      .filter(l => l !== null && l !== undefined && !isNaN(l));

    // FIX 2: guard empty arrays — Math.min([]) = Infinity, reduce/0 = NaN
    const safeMin = (arr) => arr.length > 0 ? Math.min(...arr) : 0;
    const safeMax = (arr) => arr.length > 0 ? Math.max(...arr) : 0;
    const safeAvg = (arr) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const avgGas     = safeAvg(gasCosts);
    const avgLatency = safeAvg(latencies);
    const totalGas   = gasCosts.reduce((a, b) => a + b, 0);

    const sectorCounts = {};
    datasets.forEach(d => {
      const sector = d.metadata.Sector || "unknown";
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });

    const providerCounts = {};
    datasets.forEach(d => {
      const provider = d.metadata.Data_Provider_Type || "unknown";
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });

    setStats({
      gas: {
        avg:   avgGas.toFixed(0),
        min:   safeMin(gasCosts),
        max:   safeMax(gasCosts),
        total: totalGas
      },
      latency: {
        avg: avgLatency.toFixed(2),
        min: safeMin(latencies).toFixed(2),
        max: safeMax(latencies).toFixed(2)
      },
      sectors:      sectorCounts,
      providers:    providerCounts,
      totalRecords: datasets.length
    });
  }, []); // no deps — only calls setStats which is stable

  // FIX 1: calculateStats now in dep array — safe because it's memoized
  const fetchData = useCallback(async () => {
    try {
      const res = await API.get("/dataset");
      const datasets = res.data;

      let filteredData = datasets;
      if (timeRange === "hour") {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        filteredData = datasets.filter(d => new Date(d.createdAt) >= oneHourAgo);
      } else if (timeRange === "day") {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filteredData = datasets.filter(d => new Date(d.createdAt) >= oneDayAgo);
      }

      setData(filteredData);
      calculateStats(filteredData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setLoading(false);
    }
  }, [timeRange, calculateStats]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Data helpers ───────────────────────────────────────────

  // FIX 3: filter out null coords — Recharts renders them at (0,0)
  const getGasVsLatency = () => {
    return data
      .slice(-50)
      .map(d => ({
        gas:     d.metadata.Blockchain_Tx_Cost_Gas,
        latency: d.metadata.Authorization_Latency_sec
      }))
      .filter(p => p.gas != null && p.latency != null);
  };

  const getGasCostOverTime = () => {
    return data
      .filter(d => d.metadata.Blockchain_Tx_Cost_Gas)
      .slice(-50)
      .map((d, idx) => ({
        index: idx + 1,
        gas:   d.metadata.Blockchain_Tx_Cost_Gas,
        time:  new Date(d.createdAt).toLocaleTimeString()
      }));
  };

  const getLatencyOverTime = () => {
    return data
      .filter(d => d.metadata.Authorization_Latency_sec)
      .slice(-50)
      .map((d, idx) => ({
        index:   idx + 1,
        latency: d.metadata.Authorization_Latency_sec,
        time:    new Date(d.createdAt).toLocaleTimeString()
      }));
  };

  const getGasBySector = () => {
    const sectorGas    = {};
    const sectorCounts = {};
    data.forEach(d => {
      const sector = d.metadata.Sector || "unknown";
      const gas    = d.metadata.Blockchain_Tx_Cost_Gas;
      if (gas) {
        sectorGas[sector]    = (sectorGas[sector] || 0) + gas;
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
      }
    });
    return Object.keys(sectorGas).map(sector => ({
      sector,
      avgGas: Math.round(sectorGas[sector] / sectorCounts[sector]),
      count:  sectorCounts[sector]
    }));
  };

  const getLatencyByProvider = () => {
    const providerLatency = {};
    const providerCounts  = {};
    data.forEach(d => {
      const provider = d.metadata.Data_Provider_Type || "unknown";
      const latency  = d.metadata.Authorization_Latency_sec;
      if (latency) {
        providerLatency[provider] = (providerLatency[provider] || 0) + latency;
        providerCounts[provider]  = (providerCounts[provider] || 0) + 1;
      }
    });
    return Object.keys(providerLatency).map(provider => ({
      // FIX 4: replaceAll replaces every space, not just the first one
      provider:   provider.replaceAll(" ", "\n"),
      avgLatency: parseFloat(
        (providerLatency[provider] / providerCounts[provider]).toFixed(2)
      ),
      count: providerCounts[provider]
    }));
  };

  const getSectorDistribution = () => {
    if (!stats) return [];
    return Object.keys(stats.sectors).map(sector => ({
      name:  sector,
      value: stats.sectors[sector]
    }));
  };

  // FIX 6: out-of-range gas values caught by "other" bin
  const getGasCostDistribution = () => {
    const bins = [
      { range: "40-45k", min: 40000, max: 45000, count: 0 },
      { range: "45-50k", min: 45000, max: 50000, count: 0 },
      { range: "50-55k", min: 50000, max: 55000, count: 0 },
      { range: "55-60k", min: 55000, max: 60000, count: 0 },
      { range: "60-65k", min: 60000, max: 65000, count: 0 },
      { range: "65-70k", min: 65000, max: 70000, count: 0 },
      { range: "other",  min: -Infinity, max: Infinity, count: 0 }
    ];

    data.forEach(d => {
      const gas = d.metadata.Blockchain_Tx_Cost_Gas;
      if (gas == null) return;

      let matched = false;
      for (let i = 0; i < bins.length - 1; i++) {
        if (gas >= bins[i].min && gas < bins[i].max) {
          bins[i].count++;
          matched = true;
          break;
        }
      }
      if (!matched) bins[bins.length - 1].count++;
    });

    return bins.filter(b => !(b.range === "other" && b.count === 0));
  };

  const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#fa709a"];

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  // FIX 5: computed once and reused — was called twice in JSX before
  const sectorDistribution = getSectorDistribution();

  return (
    <div className="analytics-container">

      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2>📊 Blockchain Analytics Dashboard</h2>
          <p className="subtitle">Real-time Gas Costs & Latency Monitoring</p>
        </div>
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="all">All Data</option>
            <option value="day">Last 24 Hours</option>
            <option value="hour">Last Hour</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⛽</div>
            <div className="stat-info">
              <div className="stat-label">Avg Gas Cost</div>
              <div className="stat-value">{stats.gas.avg}</div>
              <div className="stat-range">Range: {stats.gas.min} – {stats.gas.max}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <div className="stat-label">Avg Latency</div>
              <div className="stat-value">{stats.latency.avg}s</div>
              <div className="stat-range">Range: {stats.latency.min}s – {stats.latency.max}s</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-label">Total Gas Used</div>
              <div className="stat-value">{(stats.gas.total / 1000).toFixed(1)}k</div>
              <div className="stat-range">{stats.totalRecords} transactions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <div className="stat-label">Total Records</div>
              <div className="stat-value">{stats.totalRecords}</div>
              <div className="stat-range">Across {Object.keys(stats.sectors).length} sectors</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="charts-grid">

        {/* Gas Cost Over Time */}
        <div className="chart-card full-width">
          <h3>⛽ Gas Cost Over Time (Last 50 Transactions)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getGasCostOverTime()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" label={{ value: "Transaction #", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Gas Cost", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="gas" stroke="#667eea" strokeWidth={2} dot={{ r: 3 }} name="Gas Cost" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Latency Over Time */}
        <div className="chart-card full-width">
          <h3>⏱️ Authorization Latency Over Time (Last 50 Transactions)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getLatencyOverTime()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" label={{ value: "Transaction #", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Latency (seconds)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="latency" stroke="#764ba2" fill="#764ba2" fillOpacity={0.6} name="Latency (s)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gas by Sector */}
        <div className="chart-card">
          <h3>⛽ Average Gas Cost by Sector</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getGasBySector()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sector" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgGas" fill="#667eea" name="Avg Gas Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Latency by Provider */}
        <div className="chart-card">
          <h3>⏱️ Average Latency by Provider</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getLatencyByProvider()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="provider" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgLatency" fill="#764ba2" name="Avg Latency (s)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Distribution — Pie */}
        {/* FIX 5: sectorDistribution used here from pre-computed const */}
        <div className="chart-card">
          <h3>📊 Data Distribution by Sector</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorDistribution}
                cx="50%" cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gas Cost Distribution — Histogram */}
        <div className="chart-card">
          <h3>📊 Gas Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getGasCostDistribution()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" label={{ value: "Gas Cost Range", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#43e97b" name="Transaction Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Gas Cost vs Latency — Scatter */}
      {/* FIX 3 + 4 (chart): type="number" for continuous scale, domain
          locks axes to known ranges, tickFormatter for readable labels,
          tooltip uses props.dataKey not series name to identify value */}
      <div className="chart-card">
        <h3>⛽ Gas Cost vs Latency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="gas"
              name="Gas Cost"
              type="number"
              domain={[38000, 72000]}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              label={{ value: "Gas Cost", position: "insideBottom", offset: -15 }}
            />
            <YAxis
              dataKey="latency"
              name="Latency"
              type="number"
              domain={[0, 4.5]}
              tickFormatter={(v) => `${v}s`}
              label={{ value: "Latency (s)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value, name, props) => {
                if (props.dataKey === "gas")     return [value.toLocaleString(), "Gas Cost"];
                if (props.dataKey === "latency") return [`${value}s`, "Latency"];
                return [value, name];
              }}
            />
            <Scatter name="Gas vs Latency" data={getGasVsLatency()} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="summary-table">
        <h3>📋 Detailed Statistics</h3>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Average</th>
              <th>Minimum</th>
              <th>Maximum</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>⛽ Gas Cost</td>
              <td>{stats?.gas.avg}</td>
              <td>{stats?.gas.min}</td>
              <td>{stats?.gas.max}</td>
              <td>{stats?.gas.total.toLocaleString()}</td>
            </tr>
            <tr>
              <td>⏱️ Latency (seconds)</td>
              <td>{stats?.latency.avg}</td>
              <td>{stats?.latency.min}</td>
              <td>{stats?.latency.max}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}