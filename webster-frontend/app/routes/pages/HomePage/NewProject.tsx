import { useNavigate, useLoaderData } from "react-router";
import { useEffect } from "react";

const API = import.meta.env.VITE_API;

// Required in SSR mode so clientLoader is not skipped
export function loader() {
  return null;
}

export async function clientLoader({ params }: { params: { type: string } }) {
  const res = await fetch(`${API}/projects`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: params.type === "logo" ? "Untitled Logo" : "Untitled Photo",
      canvas: { width: 800, height: 600, background: "#ffffff" },
    }),
  });
  const data = await res.json();
  return { projectId: data.id as string, type: params.type };
}

clientLoader.hydrate = true as const;

export default function NewProject() {
  const data = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.projectId) {
      navigate(
        `/${data.type === "logo" ? "logo-maker" : "edit-page"}/${data.projectId}`,
        { replace: true }
      );
    }
  }, [data]);

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Creating project...
    </div>
  );
}