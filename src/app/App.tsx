import { useState } from "react";
import { Header } from "./components/Header";
import { ToolsPanel, ToolCategory } from "./components/ToolsPanel";
import { FeaturesPanel } from "./components/FeaturesPanel";
import { Canvas } from "./components/Canvas";
import { RightPanel } from "./components/RightPanel";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>(null);

  return (
    <div className="size-full flex flex-col dark">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <ToolsPanel
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <FeaturesPanel
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />

        <Canvas />

        <RightPanel />
      </div>
    </div>
  );
}
