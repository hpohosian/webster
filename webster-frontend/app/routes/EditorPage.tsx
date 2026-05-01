import { Header } from "./../components/Header";
import { FeaturesPanel } from "./../components/FeaturesPanel";
import { Canvas } from "./../components/Canvas";
import { RightPanel } from "./../components/RightPanel";
import { ToolsPanel } from "./../components/ToolsPanel";

export default function EditorPage() {
  // Kein useState mehr hier!
  return (
    <div style={{
      width: "100%", height: "100vh",
      display: "flex", flexDirection: "column",
      background: "#0d0d12", fontFamily: "system-ui, sans-serif", color: "#ccc",
    }}>
      <Header />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <ToolsPanel />      
        <FeaturesPanel />    
        <Canvas />         
        <RightPanel />       
      </div>
    </div>
  );
}