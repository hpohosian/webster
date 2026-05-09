import { AuthHeader } from "../../components/AuthHeader";
import { Link } from "react-router";
import "./HomePage.css";

export async function loader() {
  return null;
}

export default function HomePage() {
  return (
    <div className="home-page">
      <AuthHeader />
      <main className="home-main">
        <Link to="logo-maker" className="home-btn home-btn-primary">
          <div className="home-btn-icon">✏️</div>
          <div className="home-btn-divider" />
          <div className="home-btn-label">
            <span>Edit photo</span>
          </div>
        </Link>

        <Link to="edit-page" className="home-btn home-btn-secondary">
          <div className="home-btn-icon">⭐</div>
          <div className="home-btn-divider" />
          <div className="home-btn-label">
            <span>Create logo</span>
          </div>
        </Link>
      </main>
    </div>
  );
}