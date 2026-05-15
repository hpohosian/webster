import { Header } from "./../components/Header";
import { FeaturesPanel } from "./../components/FeaturesPanel";
import { Canvas } from "./../components/Canvas";
import { RightPanel } from "./../components/RightPanel";
import { ToolsPanel } from "./../components/ToolsPanel";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEditorStore } from "../store/editorStore";

export default function EditorPage() {
  const { projectId } = useParams();

  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const setCanvasJSON = useEditorStore((s) => s.setCanvasJSON);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      if (!projectId ) return;

      

      const res = await fetch(`http://localhost:3000/projects/${projectId }`, {
        credentials: "include",
      });

      const project = await res.json();

      setCanvasSize({
        w: project.projectData.canvas.width,
        h: project.projectData.canvas.height,
      });      

      setCanvasJSON(project.projectData.objects);
      // setLayers(project.layers || []);

      setLoading(false);
    }

    loadProject();
  }, [projectId]);  
  
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