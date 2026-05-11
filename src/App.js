import React from "react";
import Header from "./components/Header";
import ImportDataset from "./components/ImportDataset";
import DatasetTable from "./components/DatasetTable";
import DataOwnerUpload from "./components/DataOwnerUpload";
import DataRequester from "./components/DataRequester";
import BlockchainLog from "./components/BlockchainLog";
import DisasterCenter from "./components/DisasterCenter";
import LiveDataGenerator from "./components/LiveDataGenerator";
import Analytics from "./components/Analytics"; 
function App() {
  return (
    <>
      <Header />

      <div className="container">

        <div className="grid">
          <DataOwnerUpload />
          <DataRequester />
          <BlockchainLog />
        </div>
        <LiveDataGenerator />
        <DisasterCenter />
        <Analytics />
        <div className="top-actions">
          <ImportDataset />
        </div>
        <DatasetTable />
      </div>
    </>
  );
}

export default App;
