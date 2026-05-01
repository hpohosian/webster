export type Tab = 'profile' | 'interests' | 'password';

export interface ProfileForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  hideFromAttendees: boolean;
  // location: string;
}

type ProfileFormKey = keyof ProfileForm;

export interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

export type PasswordFormKey = keyof PasswordForm;

export type FormErrors = Partial<Record<ProfileFormKey, string>>;

export interface ToastState {
  msg: string;
  type: 'success' | 'error';
}

export interface NavItemProps {
  icon: JSX.Element;
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  delay?: number;
  children: JSX.Element | JSX.Element[];
}

export interface FieldProps {
  label: string;
  optional?: boolean;
  error?: string;
  full?: boolean;
  children: JSX.Element | JSX.Element[];
}

// -- Sub-components 

export const NavItem = ({ icon, label, active, onClick }: NavItemProps) => (
  <button className={`ep-nav-item${active ? ' active' : ''}`} onClick={onClick}>
    {icon}
    {label}
  </button>
);

export const SectionCard = ({ title, subtitle, delay = 0, children }: SectionCardProps) => (
  <div className="ep-section-card" style={{ animationDelay: `${delay}s` }}>
    <div className="ep-section-header">
      <h2 className="ep-section-title">{title}</h2>
      {subtitle && <span className="ep-section-subtitle">{subtitle}</span>}
    </div>
    {children}
  </div>
);

export const Field = ({ label, optional, error, full, children }: FieldProps) => (
  <div className={`ep-field${full ? ' full' : ''}`}>
    <label className="ep-label">
      {label}
      {optional && <span className="ep-label-optional">(optional)</span>}
    </label>
    {children}
    {error && <span className="ep-error-msg">{error}</span>}
  </div>
);
