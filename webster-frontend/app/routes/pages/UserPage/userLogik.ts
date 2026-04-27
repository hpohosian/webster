import { useState, useEffect } from "react";


export interface UserProfile {
  id: string;
  username: string; 
  email: string;
  createdAt: string;
  avatarLetter: string;
  profilePicture: string;
}

const API = import.meta.env.VITE_API;

export async function fetchCurrentUser(): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${API}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
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
  
  if (!res.ok) {
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
        profileData.avatarLetter = profileData.username[0];

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