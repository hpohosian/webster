const API = import.meta.env.VITE_API;

export async function handleDelete(
  id: string,
  navigate: (path: string) => void,
) {
  try {
    const delRes = await fetch(`${API}/users/${id}`, {
      credentials: 'include',
      method: 'DELETE',
    });

    if (!delRes.ok) {
      console.error(delRes.statusText ?? 'Unknown error');
      return;
    }

    navigate('/');
  } catch (err: any) {
    console.error(err.message ?? 'Unknown error');
  }
}

interface HandleUpdateProps {
  e: React.SubmitEvent;
  validate: () => any;
  setErrors: React.Dispatch<React.SetStateAction<any>>;
  form: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    bio: string;
    hideFromAttendees: boolean;
  };
  fileRef: React.RefObject<HTMLInputElement | null>;
  navigate: (path: string) => void;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  userId?: string;
}

export async function handleUpdate({
  e,
  validate,
  setErrors,
  form,
  fileRef,
  navigate,
  setSaving,
  showToast,
  userId,
}: HandleUpdateProps) {
  e.preventDefault();

  try {
    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);

    const formData = new FormData();

    formData.append('username', form.username);

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    formData.append('fullName', fullName);

    formData.append('bio', form.bio);
    formData.append('hideFromAttendees', String(form.hideFromAttendees));

    const file = fileRef.current?.files?.[0];

    if (file) {
      formData.append('profilePicture', file);
    }

    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });
        

    const res = await fetch(`${API}/users/me`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(err);
      showToast('Failed to update profile', 'error');
      return;
    }

    showToast('Profile updated successfully');
    navigate(`/profile/${userId}`);
  } catch (err: any) {
    console.error(err.message ?? 'Unknown error');
    showToast('Something went wrong', 'error');
  } finally {
    setSaving(false);
  }
}
