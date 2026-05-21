import { Header } from "./../components/Header";
import { Canvas } from "./../components/Canvas";
import { LogoToolsPanel, type CanvasTool, type PanelCategory } from "./../components/LogoTools";
import { IconsPanel } from "./../components/LogoToolsComponents/Icons";
import { TextPanel } from "./../components/LogoToolsComponents/Text";
import { BoxPanel } from "./../components/LogoToolsComponents/LogoBox";
import { LayoutPanel } from "./../components/LogoToolsComponents/Layout";
import { useState } from "react";
import { LogoProvider } from "./../components/LogoToolsComponents/LogoProvider";
import { LogoPreview } from "./../components/LogoToolsComponents/Prewiew"


export default function LogoMakerPage() {
  const [activeTool, setActiveTool]   = useState<CanvasTool>("pointer");
  const [activePanel, setActivePanel] = useState<PanelCategory>(null);
 
  return (
    <LogoProvider>
      <div className="size-full flex flex-col dark" style={{ height: "100vh" }}>
        <Header />
 
        <div className="flex-1 flex overflow-hidden">
          {/* Left icon rail */}
          <LogoToolsPanel
            activeTool={activeTool}
            activePanel={activePanel}
            onToolSelect={setActiveTool}
            onPanelSelect={setActivePanel}
          />
            {activePanel === "text" && <TextPanel />}
            {activePanel === "icons" && <IconsPanel />}
            {activePanel === "box" && <BoxPanel />}
            {activePanel === "templates" && <LayoutPanel />}
          <div className="size-full m-5 flex items-center justify-center" style={{ height: "100vh", background: "#f8f8f8", justifyContent: "center"}}>
            <LogoPreview/>
          </div>
        </div>
      </div>
    </LogoProvider>
  );
}
 
