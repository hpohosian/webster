import { AuthHeader } from "../AuthHeader";
import { Link } from "react-router";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="home-page">
      <AuthHeader />
      <main className="home-main">
        <Link to="http://localhost:3000/projects/new/photo" className="home-btn home-btn-primary">
          <div className="home-btn-icon">✏️</div>
          <div className="home-btn-divider" />
          <div className="home-btn-label">
            <span>Edit photo</span>
          </div>
        </Link>

        <Link to="http://localhost:3000/projects/new/logo" className="home-btn home-btn-secondary">
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