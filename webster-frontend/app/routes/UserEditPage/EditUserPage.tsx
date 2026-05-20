import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import './EditUserPage.css';
import { userProfile } from '../ProjectPage/userLogik';
import type {
  ProfileFormKey, ToastState,
  FormErrors, ProfileForm,
} from './EditUserFunctions';
import { SectionCard, Field } from './EditUserFunctions';
import { handleDelete, handleUpdate } from './EditUserFunctions';

const API = import.meta.env.VITE_API;

export default function UserEditPage() {
  const navigate = useNavigate();
  const { profile, loading, error } = userProfile();

  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    username: '',
    email: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | undefined >(undefined);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username ?? '',
        email: profile.email ?? '',
      });

      if (profile.profilePicture) {
        setAvatarPreview(`${API}/${profile.profilePicture}`);
      }
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!form.username.trim()) {
      errs.username = 'Username is required';
    } else if (form.username.length < 3) {
      errs.username = 'At least 3 characters';
    }

    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Invalid email address';
    }
    return errs;
  };

  const showToast = (
    msg: string,
    type: ToastState['type'] = 'success',
  ) => {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const field = (key: ProfileFormKey) => ({
    value: form[key],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));

      if (errors[key]) {
        setErrors((prev) => ({
          ...prev,
          [key]: undefined,
        }));
      }
    },
    className: `ep-input${errors[key] ? ' error' : ''}`,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !profile) {
    return <div>Failed to load profile</div>;
  }

  return (
    <form
      onSubmit={(e) =>
        handleUpdate({
          e,
          validate,
          setErrors,
          form,
          fileRef,
          navigate,
          setSaving,
          showToast,
          userId: profile?.id
        })
      }
    >
      <div className="ep-page">

        <div className="ep-body">
          {/* Sidebar */}
          <aside className="ep-sidebar">
            <div className="ep-avatar-card">
              <div className="ep-avatar-wrap">
                <div className="ep-avatar">
                  {avatarPreview && !avatarPreview.includes('default.png') ? (
                    <img src={avatarPreview} alt="avatar" />)
                    :(
                      <></>
                    )}
                   {/* <img src={avatarPreview} alt="avatar" /> */}
                </div>
                <button
                  className="ep-avatar-edit-btn"
                  onClick={() => fileRef.current?.click()}
                  title="Change photo"
                  type="button"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="ep-avatar-email">{profile?.email}</div>

              <div className="ep-divider" />
            </div>

            {/* Danger zone */}
            <div className="ep-danger-card">
              <div className="ep-danger-title">Danger zone</div>
              {profile?.id ?(
                <button type="button" className="ep-danger-btn" onClick={() => handleDelete(profile?.id, navigate)}>Delete account</button>
              ):( <></> )
              }
            </div>
          </aside>

          {/* Main */}
          <main className="ep-content">
              <SectionCard title="Personal info" delay={0.04}>
                <div className="ep-form-grid">
                  <Field label="Username" error={errors.username}>
                    <div className="ep-input-wrap">
                      <span className="ep-input-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        {...field('username')}
                        className={`ep-input has-icon${errors.username ? ' error' : ''}`}
                        placeholder={profile?.username}
                      />
                    </div>
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <div className="ep-input-wrap">
                      <span className="ep-input-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      <input
                        {...field('email')}
                        className={`ep-input has-icon${errors.email ? ' error' : ''}`}
                        placeholder={profile?.email}
                        type="email"
                        disabled
                        style={{ cursor: 'not-allowed' }}
                      />
                    </div>
                  </Field>

                </div>

                <div className="ep-action-bar">
                  <Link to={`/projects/${profile?.id}`} className="ep-cancel-btn">Cancel</Link>
                  <button type="submit" className="ep-save-btn" disabled={saving}>
                    {saving ? <><span className="ep-spinner" /> Saving…</> : 'Save changes'}
                  </button>
                </div>
              </SectionCard>
          </main>
        </div>

        {toast && (
          <div className={`ep-toast ${toast.type}`}>
            {toast.msg}
          </div>
        )}
      </div>
    </form>
  );
}