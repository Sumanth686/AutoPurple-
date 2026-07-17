import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ThreatHunting from "./pages/ThreatHunting";
import IAMAudit from "./pages/IAMAudit";
import IncidentResponse from "./pages/IncidentResponse";

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-800 p-4 flex space-x-4 text-white">
        <Link to="/">Dashboard</Link>
        <Link to="/hunting">Threat Hunting</Link>
        <Link to="/iam">IAM Audit</Link>
        <Link to="/cases">Cases</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hunting" element={<ThreatHunting />} />
        <Route path="/iam" element={<IAMAudit />} />
        <Route path="/cases" element={<IncidentResponse />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
