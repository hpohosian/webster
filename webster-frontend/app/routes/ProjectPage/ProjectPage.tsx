import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./ProjectPage.css"
import { userProfile, useProjects,
        type SortKey, type Project, useTemplates, 
        type Template} from "./userLogik";
import { Pencil, Trash2 } from "lucide-react";
import { generateThumbnailFromProjectData } from "./generateThumbnail";

const API = import.meta.env?.VITE_API;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function sortProjects(projects: Project[], key: SortKey) {
  return [...projects].sort((a, b) => {
    if (key === "name") return a.name.localeCompare(b.name);
    if (key === "type") return a.type.localeCompare(b.type);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

const createProject = async (type: "photo" | "logo") => {
  try {
    const me = await fetch(`${API}/auth/me`, {
      credentials: "include",
    });

    const meData = await me.json();

    if (!meData.user) {
      window.location.href = "/login";
      return;
    }

    const res = await fetch(`${API}/projects`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: type === "logo" ? "My logo" : "My project",
        type,
        canvas: {
          width: 800,
          height: 600,
          background: "#ffffff",
        },
      }),
    });

    const project = await res.json();

    window.location.href = `/edit-page/${project.id}`;
  } catch (err) {
    console.error(err);
  }
};

const createFromTemplate = async (templateId: string) => {
  try {
    const res = await fetch(`${API}/templates/${templateId}/fork`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const project = await res.json();
    window.location.href = `/edit-page/${project.id}`;
  } catch (err) {
    console.error(err);
  }
};

function TemplateCard({
  tpl,
  onClick,
  isUserTemplate = false,
  onRename,
  onDelete,
}: {
  tpl: Template;
  onClick: () => void;
  isUserTemplate?: boolean;
  onRename?: (newTitle: string) => void;
  onDelete?: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(tpl.thumbnail);
  const [generating, setGenerating] = useState(false);
  const [editingTitle, setEditingTitle] = useState(tpl.title);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (tpl.thumbnail) return;
    if (!tpl.projectData) return;
    setGenerating(true);
    generateThumbnailFromProjectData(tpl.projectData)
      .then((url) => setPreview(url))
      .finally(() => setGenerating(false));
  }, [tpl.id]);

  const handleRenameSubmit = () => {
    if (editingTitle.trim() && editingTitle !== tpl.title) {
      onRename?.(editingTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => { if (!isEditing) onClick(); }}
        style={{
          width: "100%",
          border: "1.5px solid #ebebeb",
          borderRadius: 10,
          background: "#fff",
          cursor: "pointer",
          padding: 0,
          overflow: "hidden",
          textAlign: "left",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#a0cedc";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(69, 183, 218, 0.12)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#ebebeb";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        {/* Thumbnail */}
        <div style={{
          width: "100%", aspectRatio: "4/3",
          background: tpl.type === "logo" ? "#1a1a1a" : "#f0f0f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", position: "relative",
        }}>
          {generating && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#f5f5f5",
            }}>
              <div style={{
                width: 20, height: 20,
                border: "2px solid #e0e0e0",
                borderTopColor: "#a0cedc",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
            </div>
          )}
          {preview ? (
            <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : !generating ? (
            <span style={{ fontSize: 11, color: "#ccc" }}>No preview</span>
          ) : null}
        </div>

        {/* Label */}
        <div style={{ padding: "10px 12px 12px" }}>
          {isEditing ? (
            <input
              autoFocus
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRenameSubmit();
                }
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditingTitle(tpl.title);
                }
              }}
              onKeyUp={(e) => e.stopPropagation()}
              onBlur={handleRenameSubmit}
              style={{
                width: "100%", border: "1px solid #ddd",
                borderRadius: 6, padding: "2px 6px",
                fontSize: 13, fontWeight: 600, color: "#1a1a1a"
              }}
            />
          ) : (
            <div style={{
              fontSize: 13, fontWeight: 600, color: "#1a1a1a",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {tpl.title}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#bbb", marginTop: 3 }}>{tpl.type}</div>
        </div>
      </div>

      {isUserTemplate && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          display: "flex", gap: 4,
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditingTitle(tpl.title); }}
            title="Rename"
            style={{
              width: 26, height: 26,
              border: "none", borderRadius: 6,
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#888",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            }}
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            title="Delete"
            style={{
              width: 26, height: 26,
              border: "none", borderRadius: 6,
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#d9534f",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function TemplatesModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const { templates, loading, fetchTemplates } = useTemplates();
  const [tab, setTab] = useState<"default" | "user">("default");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const list = tab === "default" ? templates.default : templates.user;

  const renameTemplate = async (templateId: string, newTitle: string) => {
    await fetch(`${API}/templates/${templateId}/rename`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    fetchTemplates();
  };

  const deleteTemplate = async (templateId: string) => {
    const confirmed = window.confirm("Delete this template?");
    if (!confirmed) return;
    await fetch(`${API}/templates/${templateId}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchTemplates();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16,
          width: 640, maxHeight: "80vh",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
            Choose a template
          </h2>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#aaa", padding: 4 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", padding: "16px 24px 0", borderBottom: "1px solid #f0f0f0" }}>
          {(["default", "user"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              border: "none", background: "transparent", cursor: "pointer",
              padding: "8px 16px", fontSize: 13, fontWeight: 600,
              color: tab === t ? "#1a1a1a" : "#aaa",
              borderBottom: tab === t ? "2px solid #1a1a1a" : "2px solid transparent",
              marginBottom: -1, transition: "color 0.15s",
            }}>
              {t === "default" ? "Default" : "My templates"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 13 }}>Loading...</div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 13 }}>
              {tab === "user"
                ? "No saved templates yet."
                : "No default templates available."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
              {list.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  tpl={tpl}
                  onClick={() => onSelect(tpl.id)}
                  isUserTemplate={tab === "user"}        // ← вот это новое
                  onRename={(newTitle) => renameTemplate(tpl.id, newTitle)}
                  onDelete={() => deleteTemplate(tpl.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Project card thumbnail 
function ProjectThumb({ project }: { project: Project }) {
  const isLogo = project.type === "logo";
  // console.log("project.thumbnail", console.log(project.thumbnail));
  return (
    <div style={{
      width: "100%",
      aspectRatio: "4/3",
      background: isLogo ? "#1a1a1a" : "#e8e8e8",
      borderRadius: "10px 10px 0 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    }}>
      <div className="thumb-shimmer" />


      {project.thumbnail ? (
        <img
          src={project.thumbnail}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          No preview
        </div>
      )}
    </div>
  );
}

// ─── Type badge 
function TypeBadge({ type }: { type: Project }) {
  const isLogo = (type === "logo");
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      background: isLogo ? "rgba(126,200,227,0.12)" : "#f0f0f0",
      color: isLogo ? "#5ab6d4" : "#999",
      border: isLogo ? "1px solid rgba(126,200,227,0.25)" : "1px solid #e4e4e4",
    }}>
      {type}
    </span>
  );
}

// Empty state 
function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      flex: 1, padding: "80px 24px", textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        border: "1.5px solid #d0d0d0",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <svg width="28" height="28" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <p style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "#bbb",
      }}>
        No projects yet
      </p>
      <p style={{ fontSize: 13, color: "#ccc", marginTop: 6, maxWidth: 240 }}>
        Create your first photo edit or logo to get started.
      </p>
    </div>
  );
}
 
export default function MyProjectsPage() {
  const [filter, setFilter] = useState<"all" | Project>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { profile } = userProfile();
  const { projects, loading } = useProjects();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const renameProject = async (id: string) => {
    try {
      await fetch(`${API}/projects/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTitle,
        }),
      });

      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      await fetch(`${API}/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };
  
  // Filter + sort
  const visible = sortProjects(
    projects.filter((p) => {
      const matchType = filter === "all" || p?.type === filter;
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    }),
    sort
  );  

  return (
    <>
      <div style={{
        display: "flex", flexDirection: "column",
        height: "100%", minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        background: "#323232"
      }}>

        {/* --user bar--*/}
        <div style={{
          borderBottom: "1px solid #e8e8e8",
          background: "#f6f6f6",
          padding: "18px 36px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Avatar */}
            <Link to={`/profile/${profile?.id}/edit`} style={{
              width: 49, height: 49, borderRadius: "50%",
              background: "#e4e4e4",
              border: "1.5px solid #d0d0d0",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, overflow: "hidden"
            }}>
              { profile?.profilePicture && !profile.profilePicture.includes('default.png') ? 
              ( <img src={`${API}/${profile.profilePicture}`} alt="avatar" />)
              :(
              <svg width="22" height="22" fill="none" stroke="#bbb" strokeWidth="1.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              )}
            </Link>

            <div>
              <h1 style={{
                fontSize: 22, fontWeight: 600,
                color: "#1a1a1a", letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}>
                {profile?.username}
              </h1>
              <h2 style={{
                fontSize: 20, fontWeight: 600,
                color: "#1a1a1a", letterSpacing: "-0.02em",
                lineHeight: 1,
              }}>
                My Projects
              </h2>
              <p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                {projects.length} projects
              </p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="new-btn"
              style={{ background: "#76afc0", color: "#fff" }}
              onClick={() => setTemplateModalOpen(true)}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              From Template
            </button>
            <button className="new-btn" onClick={() => createProject("photo")}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Photo Edit
            </button>
            <button className="new-btn" style={{ background: "#5ab6d4" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Logo
            </button>
          </div>
        </div>

        {/* ── SPECTRUM ACCENT ── */}
        {/* <div className="spectrum-bar" style={{ margin: "0 36px", borderRadius: 0 }} /> */}

        {/* ── CONTROLS ROW ── */}
        <div style={{
          padding: "18px 36px 0",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          {/* Filter chips */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "photo", "logo"] as const).map((f) => (
              <button
                key={f}
                className={`filter-chip${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg
                width="14" height="14" fill="none" stroke="#bbb" strokeWidth="1.8"
                viewBox="0 0 24 24"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              >
                <circle cx="11" cy="11" r="7"/>
                <path d="M16.5 16.5L21 21" strokeLinecap="round"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>

            {/* Sort */}
            <div style={{ position: "relative" }}>
              <select
                className="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="recent">Recent</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
              </select>
              <svg width="10" height="10" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24"
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>

            {/* View toggle */}
            <button
              className={`view-toggle${view === "grid" ? " active" : ""}`}
              onClick={() => setView("grid")}
              title="Grid view"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button
              className={`view-toggle${view === "list" ? " active" : ""}`}
              onClick={() => setView("list")}
              title="List view"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "24px 36px 48px", flex: 1 }}>
          {visible.length === 0 ? (
            <EmptyState />
          ) : view === "grid" ? (
            /* Grid */
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 18,
            }}>
              {visible.map((project, i) => (
                <Link
                  key={project.id}
                  to={`/edit-page/${project.id}`}
                  className="project-card fade-in"
                  style={{ animationDelay: `${i * 0.05}s`, display: "block" }}
                >
                  <ProjectThumb project={project} />
                  <div style={{ padding: "12px 14px 14px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#1a1a1a",
                          gap: 6,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {editingId === project.id ? (
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onClick={(e) => e.preventDefault()}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                await renameProject(project.id);
                                setEditingId(null);
                              }

                              if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                            onBlur={async () => {
                              await renameProject(project.id);
                              setEditingId(null);
                            }}
                            style={{
                              border: "1px solid #ddd",
                              borderRadius: 6,
                              padding: "2px 6px",
                              fontSize: 14,
                              fontWeight: 600,
                              width: "100%",
                            }}
                          />
                        ) : (
                          <>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#1a1a1a",
                                lineHeight: 1.3,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {project.title}
                            </span>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setEditingId(project.id);
                                setEditingTitle(project.title);
                              }}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                color: "#aaa",
                              }}
                            >
                              <Pencil size={13} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                deleteProject(project.id);
                              }}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                color: "#d9534f",
                                transition: "0.2s",
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                      <TypeBadge type={project.type} />
                    </div>
                    <div style={{ fontSize: 11, color: "#bbb", marginTop: 5 }}>
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                </Link>
              ))}

              {/* "New project" card */}
              <button
                onClick={() => createProject("photo")}
                className="project-card fade-in"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1.5px dashed #d8d8d8",
                  background: "transparent",
                  aspectRatio: "unset",
                  minHeight: 160,
                  animationDelay: `${visible.length * 0.05}s`,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: "1.5px solid #d0d0d0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 8px",
                  }}>
                    <svg width="18" height="18" fill="none" stroke="#ccc" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 12, color: "#bbb", fontWeight: 500 }}>New project</span>
                </div>
              </button>
            </div>
          ) : (
            /* List */
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visible.map((project, i) => (
                <Link
                  key={project.id}
                  to={`/edit-page/${project.id}`}
                  className="list-row fade-in"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {/* Thumbnail */}
                  <div
                    className="list-thumb"
                    style={{
                      background: project.type === "logo" ? "#1a1a1a" : "#ebebeb",
                      overflow: "hidden",
                    }}
                  >
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : project.type === "logo" ? (
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #7ec8e3, #b0e0f5)",
                        }}
                      />
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="#ccc"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </div>

                  {/* Title + rename */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minWidth: 0,
                    }}
                  >
                    {editingId === project.id ? (
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onClick={(e) => e.preventDefault()}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter") {
                            await renameProject(project.id);
                            setEditingId(null);
                          }

                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        onBlur={async () => {
                          await renameProject(project.id);
                          setEditingId(null);
                        }}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 14,
                          width: "100%",
                        }}
                      />
                    ) : (
                      <>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#1a1a1a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {project.title}
                        </span>

                        {/* Rename */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingId(project.id);
                            setEditingTitle(project.title);
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            color: "#aaa",
                          }}
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            deleteProject(project.id);
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            color: "#d9534f",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Type */}
                  <TypeBadge type={project.type} />

                  {/* Date */}
                  <span
                    style={{
                      fontSize: 12,
                      color: "#bbb",
                      minWidth: 90,
                      textAlign: "right",
                    }}
                  >
                    {formatDate(project.updatedAt)}
                  </span>

                  {/* Arrow */}
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#ccc"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 18l6-6-6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      {templateModalOpen && (
        <TemplatesModal
          onClose={() => setTemplateModalOpen(false)}
          onSelect={(id) => {
            setTemplateModalOpen(false);
            createFromTemplate(id);
          }}
        />
      )}
    </>
  );
}