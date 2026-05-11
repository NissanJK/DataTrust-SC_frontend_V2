import React, { useState, useRef } from "react";
import API from "../api/api";
export default function LiveDataGenerator() {
  const [isLive, setIsLive] = useState(false);
  const [stats, setStats] = useState({
    generated: 0,
    errors: 0,
    lastGenerated: null
  });
  const [config, setConfig] = useState({
    interval: 5, // seconds
    sectorRotation: true
  });
  const intervalRef = useRef(null);

  // Provider to Category mapping (from Python generator)
  const PROVIDER_CATEGORY_MAP = {
    "IoT Sensor": ["Environmental", "Utility"],
    "Public Agency": ["Environmental", "Citizen Service"],
    "Traffic Camera": ["Traffic"],
    "Utility Meter": ["Utility"]
  };

  // Category to allowed fields mapping
  const CATEGORY_FIELDS = {
    "Environmental": ["Temperature", "AQI"],
    "Utility": ["Energy"],
    "Citizen Service": ["Temperature", "AQI"],
    "Traffic": ["Traffic"]
  };

  // Generate Data Owner based on provider
  const generateDataOwner = (provider) => {
    if (provider === "IoT Sensor") {
      return Math.random() > 0.5 ? "Citizen" : "Researcher";
    }
    if (["Public Agency", "Traffic Camera", "Utility Meter"].includes(provider)) {
      return "CityAuthority";
    }
    return "CityAuthority"; // default
  };

  // Generate Access Policy based on category
  const generatePolicy = (category) => {
    if (category === "Environmental") {
      return "role:Citizen OR role:CityAuthority OR role:Researcher AND attribute:sensitivity=public";
    }
    if (category === "Utility" || category === "Citizen Service") {
      return "role:CityAuthority OR role:Researcher AND attribute:sensitivity=private";
    }
    if (category === "Traffic") {
      return "role:CityAuthority OR role:Citizen AND attribute:sensitivity=public";
    }
    return "role:CityAuthority";
  };

  // Clamp value between min and max
  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };

  // Normal distribution (Box-Muller transform)
  const normalRandom = (mean, stdDev) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  };
  const countRef = useRef(0);
  // Generate realistic data following Python generator rules
  const generateRealisticData = () => {
    const sectors = ['sector1', 'sector2', 'sector3', 'sector4', 'sector5'];
    const providers = ['IoT Sensor', 'Public Agency', 'Traffic Camera', 'Utility Meter'];

    // Select provider (equal probability: 0.25 each)
    const provider = providers[Math.floor(Math.random() * providers.length)];

    // Generate Data Owner based on provider
    const ownerRole = generateDataOwner(provider);

    // Select category based on provider
    const possibleCategories = PROVIDER_CATEGORY_MAP[provider];
    const category = possibleCategories[Math.floor(Math.random() * possibleCategories.length)];

    // Get allowed fields for this category
    const allowedFields = CATEGORY_FIELDS[category];

    // Select sector (equal probability or rotation)

    // inside generate():
    const sector = config.sectorRotation
      ? sectors[countRef.current % sectors.length]
      : sectors[Math.floor(Math.random() * sectors.length)];
    countRef.current++;
    // Generate sensor values using normal distribution (matching Python)
    // Temperature: mean=27, stddev=6, range=[15, 40]
    const tempRaw = normalRandom(27, 6);
    const temperature = parseFloat(clamp(tempRaw, 15, 40).toFixed(2));

    // AQI: mean=170, stddev=60, range=[50, 300]
    const aqiRaw = normalRandom(170, 60);
    const aqi = Math.round(clamp(aqiRaw, 50, 300));

    // Traffic: mean=100, stddev=45, range=[10, 200]
    const trafficRaw = normalRandom(100, 45);
    const traffic = Math.round(clamp(trafficRaw, 10, 200));

    // Energy: mean=250, stddev=130, range=[5, 500]
    const energyRaw = normalRandom(250, 130);
    const energy = parseFloat(clamp(energyRaw, 5, 500).toFixed(2));

    // Blockchain metrics
    // Gas: mean=55000, stddev=8500, range=[40000, 70000]
    const gasRaw = normalRandom(55000, 8500);
    const txCost = Math.round(clamp(gasRaw, 40000, 70000));

    // Latency: mean=2.3, stddev=1.0, range=[0.5, 4.0]
    const latencyRaw = normalRandom(2.3, 1.0);
    const authLatency = parseFloat(clamp(latencyRaw, 0.5, 4.0).toFixed(2));

    // Apply field rules based on category
    const data = {
      ownerRole: ownerRole,
      Sector: sector,
      Data_Provider_Type: provider,
      Data_Category: category,
      Temperature_C: allowedFields.includes("Temperature") ? temperature : null,
      Air_Quality_Index: allowedFields.includes("AQI") ? aqi : null,
      Traffic_Density: allowedFields.includes("Traffic") ? traffic : null,
      Energy_Consumption_kWh: allowedFields.includes("Energy") ? energy : null,
      Blockchain_Tx_Cost_Gas: txCost,
      Authorization_Latency_sec: authLatency,
      policy: generatePolicy(category)
    };

    return data;
  };

  const startLiveGeneration = async () => {
    setIsLive(true);

    const generate = async () => {
      try {
        const data = generateRealisticData();
        await API.post("/dataset/upload", data);

        setStats(prev => ({
          generated: prev.generated + 1,
          errors: prev.errors,
          lastGenerated: new Date().toLocaleTimeString()
        }));
      } catch (err) {
        console.error("Generation error:", err);
        setStats(prev => ({
          ...prev,
          errors: prev.errors + 1
        }));
      }
    };

    // Generate first one immediately
    await generate();

    // Then continue at intervals
    intervalRef.current = setInterval(generate, config.interval * 1000);
  };

  const stopLiveGeneration = () => {
    setIsLive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="card live-generator-card">
      <div className="live-header">
        <h3>🔴 Live Data Simulation</h3>
        {isLive && <span className="live-badge">● LIVE</span>}
      </div>

      <p className="live-description">
        Simulate real-time sensor data from all 5 sectors following realistic distribution patterns
      </p>

      {/* Configuration */}
      {!isLive && (
        <div className="live-config">
          <div className="config-group">
            <label>Generation Interval:</label>
            <select
              value={config.interval}
              onChange={(e) => setConfig({ ...config, interval: Number(e.target.value) })}
            >
              <option value={2}>⚡ Fast (2 seconds)</option>
              <option value={5}>🔄 Normal (5 seconds)</option>
              <option value={10}>🐌 Slow (10 seconds)</option>
              <option value={30}>📊 Very Slow (30 seconds)</option>
            </select>
          </div>

          <div className="config-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.sectorRotation}
                onChange={(e) => setConfig({ ...config, sectorRotation: e.target.checked })}
              />
              <span>Rotate through sectors sequentially</span>
            </label>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="live-stats">
        <div className="stat-item">
          <div className="stat-value">{stats.generated}</div>
          <div className="stat-label">Generated</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.errors}</div>
          <div className="stat-label">Errors</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.lastGenerated || 'N/A'}</div>
          <div className="stat-label">Last Generated</div>
        </div>
      </div>

      {/* Controls */}
      <div className="live-controls">
        <button
          onClick={startLiveGeneration}
          disabled={isLive}
          className="live-btn start-btn"
        >
          ▶️ Start Live
        </button>
        <button
          onClick={stopLiveGeneration}
          disabled={!isLive}
          className="live-btn stop-btn"
        >
          ⏸️ Stop
        </button>
      </div>

      {isLive && (
        <div className="live-info">
          <div className="info-box">
            <strong>📡 Simulation Active</strong>
            <p>Generating realistic sensor data every {config.interval} seconds</p>
            <ul>
              <li>✅ Provider-to-Category mapping rules</li>
              <li>✅ Normal distribution (Temperature: μ=27, σ=6)</li>
              <li>✅ Normal distribution (AQI: μ=170, σ=60)</li>
              <li>✅ Normal distribution (Traffic: μ=100, σ=45)</li>
              <li>✅ Normal distribution (Energy: μ=250, σ=130)</li>
              <li>✅ Blockchain metrics (Gas: μ=55k, Latency: μ=2.3s)</li>
              <li>✅ Category-based field filtering</li>
              <li>✅ Automatic policy generation</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}