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
        {/* Sliding panels */}
        {/* {activePanel === "text" && (
          <TextPanel
            config={{
              text: logo.text,
              fontWeight: logo.fontWeight,
              fontSize: logo.fontSize,
              letterSpacing: logo.letterSpacing,
              color: logo.color,
              fontFamily: logo.fontFamily,
            }}
            onChange={updateLogo}
          />
        )}
 
        {activePanel === "icons" && (
          <IconsPanel
            config={{
              iconId: logo.iconId,
              iconSize: logo.iconSize,
              iconColor: logo.iconColor,
              iconSvg: logo.iconSvg,
              iconLabel: logo.iconLabel,
            }}
            onChange={updateLogo}
          />
        )}
 
        {activePanel === "box" && (
          <BoxPanel
            config={{
              padding: logo.padding,
              gap: logo.gap,
              backgroundColor: logo.backgroundColor,
            }}
            onChange={updateLogo}
          />
        )}
 
        {activePanel === "templates" && (
          <LayoutPanel
            layout={logo.layout}
            onChange={(layout) => updateLogo({ layout })}
          />
        )}
        */}
          
          <LogoPreview/>
        </div>
      </div>
    </LogoProvider>
  );
}
 
