import { useState, useEffect } from "react";
type ProjectType = "photo" | "logo";
type SortKey = "recent" | "name" | "type";

export interface UserProfile {
  id: string;
  username: string; 
  email: string;
  createdAt: string;
  profilePicture: string;
}

export interface Project {
  id: string;
  title: string;
  type: "photo" | "logo";
  projectData: {
    canvas: {
      width: number;
      height: number;
      background: string;
    };
  };

  createdAt: string;
  updatedAt: string;
  thumbnail: string;
}

const API = import.meta.env.VITE_API;

export async function fetchCurrentUser(): Promise<UserProfile> {
    const res = await fetch(`${API}/users/me`, {
      credentials: "include",
    });

    if (!res.ok)  throw new Error("Failed to fetch profile");

    const data = await res.json();

    // if (!data.user) {
    //     window.location.href = "/login";
    //     return null ;
    //   }

    return data;
}

export function userProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const profileData = await fetchCurrentUser();
        if (!profileData) throw new Error("Not logged in");

        setProfile(profileData);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);
  
  return { profile, loading, error };
}

// Project
export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API}/projects`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  return await res.json();
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        
        const data = await fetchProjects();
        setProjects(data);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);
  
  return { projects, loading, error };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<{
    default: Template[];
    user: Template[];
  }>({ default: [], user: [] });
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/templates`, { credentials: "include" });
      const data = await res.json();
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  };

  return { templates, loading, fetchTemplates };
}

export type Template = {
  id: string;
  title: string;
  type: "photo" | "logo";
  thumbnail: string | null;
  projectData: Record<string, any>;
};
