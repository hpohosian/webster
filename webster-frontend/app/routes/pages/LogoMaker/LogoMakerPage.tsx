import { Header } from "./../Page/Header";
import { ToolsPanel, type ToolCategory } from "./ToolsPanel";
import { FeaturesPanel } from "./FeaturesPanel";
import { RightPanel } from "../Page/RightPanel";
import { Canvas } from "../Page/Canvas";
import {useState} from "react"

export default function EditorPage() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>(null);

  return (
    <div className="size-full flex flex-col dark">
      <Header/>

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
