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

  projectData: {
    canvas: {
      width: number;
      height: number;
      background: string;
    };
  };

  createdAt: string;
  updatedAt: string;
}

const API = import.meta.env.VITE_API;

export async function fetchCurrentUser(): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${API}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();

    // if (!data.user) {
    //     window.location.href = "/login";
    //     return null ;
    //   }

    return data.user ?? null;
  } catch {
    return null;
  }
}

//user profile 
export async function fetchUserProfile(id: string): Promise<UserProfile> {
  const res = await fetch(`${API}/users/${id}`, {
    credentials: "include",
  });

  const data = await res.json();
  
  if (!data.ok) {
    throw new Error("Failed to fetch profile");
  }
  return (data);
}

export function userProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const user = await fetchCurrentUser();
        if (!user) throw new Error("Not logged in");

        const profileData = await fetchUserProfile(user?.id);

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