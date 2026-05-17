import { useState } from "react";
import { Link } from "react-router";
import "./ProjectPage.css"
import { userProfile, useProjects,
        type SortKey, type Project } from "./userLogik";
import { Pencil, Trash2 } from "lucide-react";

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
    const me = await fetch("http://localhost:3000/auth/me", {
      credentials: "include",
    });

    const meData = await me.json();

    if (!meData.user) {
      window.location.href = "/login";
      return;
    }

    const res = await fetch("http://localhost:3000/projects", {
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

// ─── Project card thumbnail 
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

      {/* {isLogo ? (
        // Logo placeholder
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 8px",
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: "linear-gradient(135deg, #7ec8e3, #b0e0f5)",
            }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Logo
          </div>
        </div>
      ) : (
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "1.5px solid #ccc",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="24" height="24" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      )} */}

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
  const isLogo = type === "logo";
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

// ─── Empty state 
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

// ─── Main page 
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

  const renameProject = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/projects/${id}`, {
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
      await fetch(`http://localhost:3000/projects/${id}`, {
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
        background: "f0f0f0"
      }}>

        {/*TOP BAR*/}
        <div style={{
          borderBottom: "1px solid #e8e8e8",
          background: "#f7f7f7",
          padding: "18px 36px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Avatar */}
            <Link to={`/profile/${profile?.id}/edit`} style={{
              width: 46, height: 46, borderRadius: "50%",
              background: "#e4e4e4",
              border: "1.5px solid #d0d0d0",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              { profile?.profilePicture && !profile.profilePicture.includes('default.png') ? 
              ( <img src={`http://localhost:3000/${profile.profilePicture}`} alt="avatar" />)
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
                fontSize: 22, fontWeight: 600,
                color: "#1a1a1a", letterSpacing: "-0.02em",
                lineHeight: 1.1,
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
            <button className="new-btn" onClick={createProject}>
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
                      {/* <span style={{
                        fontSize: 14, fontWeight: 600,
                        color: "#1a1a1a", lineHeight: 1.3,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {project.title}
                      </span> */}
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
                  {/* Thumb */}
                  <div
                    className="list-thumb"
                    style={{ background: project.type === "logo" ? "#1a1a1a" : "#ebebeb" }}
                  >
                    {project.type === "logo" ? (
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: "linear-gradient(135deg, #7ec8e3, #b0e0f5)",
                      }} />
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    )}
                  </div>

                  {/* Name */}
                  <span style={{
                    flex: 1, fontSize: 14, fontWeight: 500, color: "#1a1a1a",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {project.title}
                  </span>

                  {/* Type badge */}
                  <TypeBadge type={project.type} />

                  {/* Date */}
                  <span style={{
                    fontSize: 12, color: "#bbb", minWidth: 90, textAlign: "right",
                  }}>
                    {formatDate(project.updatedAt)}
                  </span>

                  {/* Arrow */}
                  <svg width="14" height="14" fill="none" stroke="#ccc" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}