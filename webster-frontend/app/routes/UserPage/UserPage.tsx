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
        </aside>

        {/* -- Main -- */}
        <main className='content'>
          {error && <div className='errorBox'>{error}</div>}

        </main>
      </div>

    </div>
  );
}