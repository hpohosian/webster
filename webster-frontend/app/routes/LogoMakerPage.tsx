import { Header } from "./../components/Header";
import { FeaturesPanel } from "./../components/FeaturesPanel";
import { Canvas } from "./../components/Canvas";
import { LogoToolsPanel, type CanvasTool, type PanelCategory } from "./../components/LogoTools";
import { IconsPanel } from "./../components/LogoToolsComponents/Icons";
import { TextPanel, type FontWeight } from "./../components/LogoToolsComponents/Text";
import { BoxPanel } from "./../components/LogoToolsComponents/LogoBox";
import { LayoutPanel, type LayoutVariant } from "./../components/LogoToolsComponents/Layout";
import { useState } from "react";

interface LogoState {
  // Text
  text: string;
  fontWeight: FontWeight;
  fontSize: number;
  letterSpacing: number;
  color: string;
  fontFamily: string;
  // Icon
  iconId: string | null;
  iconSize: number;
  iconColor: string;
  // Box
  padding: number;
  gap: number;
  backgroundColor: string;
  // Layout
  layout: LayoutVariant;
}
 
const DEFAULT_LOGO: LogoState = {
  text: "",
  fontWeight: "normal",
  fontSize: 48,
  letterSpacing: 0,
  color: "#e5e5e7",
  fontFamily: "Poppins",
  iconId: null,
  iconSize: 80,
  iconColor: "#bdd6df",
  padding: 40,
  gap: 16,
  backgroundColor: "var(--background)",
  layout: "Icon-Left",
};

export default function LogoMakerPage() {
  const [activeTool, setActiveTool]   = useState<CanvasTool>("pointer");
  const [activePanel, setActivePanel] = useState<PanelCategory>(null);
  const [logo, setLogo] = useState<LogoState>(DEFAULT_LOGO);
 
  const updateLogo = (patch: Partial<LogoState>) =>
    setLogo((prev) => ({ ...prev, ...patch }));
 
  return (
    <div className="size-full flex flex-col dark">
      <Header />
 
      <div className="flex-1 flex overflow-hidden">
        {/* Left icon rail */}
        <LogoToolsPanel
          activeTool={activeTool}
          activePanel={activePanel}
          onToolSelect={setActiveTool}
          onPanelSelect={setActivePanel}
        />
 
        {/* Sliding panels */}
        {activePanel === "text" && (
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
 
        {/* Main canvas */}
        <Canvas />
      </div>
    </div>
  );
}
 
