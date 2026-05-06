import { Link } from 'react-router';
import { useState } from 'react';
import {AuthHeader} from '../../components/AuthHeader';
import "./UserPage.css";
import "../UserEditPage/EditUserPage.css"
import { 
  userProfile,
} from "./userLogik";


export default function UserPage() {
  const { profile, loading, error } = userProfile();

  const createProject = async () => {
    try {
      const me = await fetch("http://localhost:3000/auth/me", {
        credentials: "include",
      });

      const meData = await me.json();

      console.log(meData);
      

      if (!meData.user) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("http://localhost:3000/projects", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "My project",
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

  return (
    <div className='page'>
      <AuthHeader/>

      <div className='body'>
        {/* -- Sidebar -- */}
        <aside className='sidebar'>
          <div className='profileCard'>
            <div className='avatarWrap'>
              <div
                className='avatar'
                style={{ background: profile?.profilePicture ?? "gradient (90gr, #de7962, #f0a267" }}
              >
                {loading ? (
                  "…"
                ) : profile?.profilePicture && !profile.profilePicture.includes('default.png') ? (
                  <img src={`http://localhost:3000/${profile.profilePicture}`} alt="avatar" />
                ) : profile?.avatarLetter ? (
                  <div className="avatarLetter">{profile.avatarLetter}</div>
                ) : (
                  <div className="avatarLetter">U</div>
                )}
              </div>
            </div>

            <div className='profileInfo'>
              <div className='profileUsername'>
                {loading ? "Loading…" : profile?.username}
              </div>
              <div className='profileEmail'>{profile?.email ?? ""}</div>
              <Link to={`/profile/${profile?.id}/edit`} className='editProfileLink'>
                Edit profile
              </Link>
            </div>

            <div className='divider' />

            <div className='metaList'>
              <div className='metaItem'>
                Joined {profile?.createdAt ?? "—"}
              </div>
            </div>
          </div>

          {/* Company */}
          <div className='companyCard'>
            <p className='companyCardTitle'>Organise events?</p>
            <p className='companyCardDesc'>
              Create a company profile and create your events.
            </p>
          </div>

          <button onClick={createProject}  className="btn-primary px-7 py-3.5 rounded-full bg-[#5ab6d4] text-white text-[15px] font-medium tracking-wide">
            Open Photo Editor
          </button>
        </aside>

        {/* -- Main -- */}
        <main className='content'>
          {error && <div className='errorBox'>{error}</div>}

        </main>
      </div>

    </div>
  );
}