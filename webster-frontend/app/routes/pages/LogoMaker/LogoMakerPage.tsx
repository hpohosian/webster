import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Header } from "./../Page/Header";
import { ToolsPanel, type ToolCategory } from "./ToolsPanel";
import { FeaturesPanel } from "./FeaturesPanel";
import { RightPanel } from "../Page/RightPanel";
import { Canvas } from "../Page/Canvas";

const API = import.meta.env.VITE_API;

export default function LogoMakerPage() {
  const { projectId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>(null);
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    if (!projectId) return;
    fetch(`${API}/elements/project/${projectId}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setElements)
      .catch(console.error);
  }, [projectId]);

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
          projectId={projectId!}
          onElementAdded={(el) => setElements((prev) => [...prev, el])}
        />

        <Canvas
          projectId={projectId!}
          elements={elements}
        />

        <RightPanel
          elements={elements}
          setElements={setElements}
          projectId={projectId!}
        />
      </div>
    </div>
  );
}