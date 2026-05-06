import { AuthHeader } from "../../components/AuthHeader";
import { Link } from "react-router";
// import "./HomePage.css";
import { useState, useEffect, useRef } from "react";

import before from '../../assets/before.png';
import after from '../../assets/after.png';

export async function loader() {
  return null;
}


export default function HomePage() {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const createProject = async () => {
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
    <div
      className="min-h-screen bg-[#f0f0f0] text-[#1a1a1a] overflow-x-hidden"
      style={{ fontFamily: "'Elms Sans', sans-serif" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Elms+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { cursor: default; }
        .btn-primary { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(100,180,220,0.35); }
        .btn-secondary:hover { transform: translateY(-2px); }
        .fade-up { opacity: 0; transform: translateY(32px); transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1); }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.15s; }
        .delay-2 { transition-delay: 0.3s; }
        .delay-3 { transition-delay: 0.45s; }
        .delay-4 { transition-delay: 0.6s; }
        .slider-handle { cursor: ew-resize; }
        .grain::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
          z-index: 100;
        }
        .prismat-logo-dot { background: linear-gradient(135deg, #7ec8e3, #b0e0f5); }
        .spectrum-bar { background: linear-gradient(90deg, #f87171, #fb923c, #facc15, #86efac, #67e8f9, #818cf8, #e879f9); }
      `}</style>

      {/* Grain overlay */}
      <div className="grain fixed inset-0 pointer-events-none z-50" />

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-40 px-8 py-5 flex items-center justify-between bg-[#f0f0f0] border-b border-[#e0e0e0] fade-up ${heroVisible ? "visible" : ""}`}>
        <div className="flex items-center gap-2.5">
          <div className="prismat-logo-dot w-2.5 h-2.5 rounded-full" />
          <span className="text-[15px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">Prismat</span>
        </div>
        <div className="flex items-center gap-8 text-[13px] text-[#888] tracking-wide">
          <Link to="#" className="hover:text-[#1a1a1a] transition-colors">Features</Link>
          <Link to="#" className="hover:text-[#1a1a1a] transition-colors">Pricing</Link>
          <Link to="#" className="hover:text-[#1a1a1a] transition-colors">About</Link>
          <Link to="/login" className="px-4 py-1.5 border border-[#ccc] rounded-full text-[#1a1a1a] hover:border-[#7ec8e3] hover:text-[#7ec8e3] transition-all text-[13px]">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-16 px-8 max-w-6xl mx-auto">
        {/* Spectrum accent bar */}
        <div className={`fade-up ${heroVisible ? "visible" : ""} delay-1 mb-10`}>
          <div className="spectrum-bar h-[2px] w-24 rounded-full mb-8" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <h1
              className={`fade-up ${heroVisible ? "visible" : ""} delay-1 text-[56px] leading-[1.05] font-light tracking-[-0.02em] text-[#1a1a1a] mb-6`}
            >
              Transform your
              <br />
              <span className="font-semibold" style={{ color: "#7ec8e3" }}>images</span>
              <br />
              effortlessly.
            </h1>

            <p
              className={`fade-up ${heroVisible ? "visible" : ""} delay-2 text-[17px] leading-relaxed text-[#666] mb-10 max-w-md font-light`}
            >
              Prismat is a precision photo editing and logo creation suite. Drag light through glass — shape it into something extraordinary.
            </p>

            {/* CTA Buttons */}
            <div className={`fade-up ${heroVisible ? "visible" : ""} delay-3 flex flex-wrap gap-4`}>
              <button onClick={createProject}  className="btn-primary px-7 py-3.5 rounded-full bg-[#5ab6d4] text-white text-[15px] font-medium tracking-wide">
                Open Photo Editor
              </button>
              <Link to="logo-maker"  className="btn-secondary px-7 py-3.5 rounded-full border border-[#ccc] bg-white text-[#1a1a1a] text-[15px] font-medium tracking-wide hover:border-[#7ec8e3] transition-all">
                Open Logo Creator
              </Link>
            </div>

            {/* Stats row */}
            <div className={`fade-up ${heroVisible ? "visible" : ""} delay-4 flex gap-8 mt-12`}>
              {[ ["99%", "Quality preserved"], ["2 tools", "One platform"]].map(([val, label]) => (
                <div key={label}>
                  <div className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight">{val}</div>
                  <div className="text-[12px] text-[#999] tracking-wide mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Before/After slider */}
          <div className={`fade-up ${heroVisible ? "visible" : ""} delay-2`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-400/20 select-none">
              {/* Labels */}
              <div className="absolute top-4 left-4 z-20 px-2.5 py-1 bg-white/80 backdrop-blur-sm rounded-full text-[11px] font-semibold tracking-widest text-[#999] uppercase">
                Before
              </div>
              <div className="absolute top-4 right-4 z-20 px-2.5 py-1 bg-[#7ec8e3]/80 backdrop-blur-sm rounded-full text-[11px] font-semibold tracking-widest text-white uppercase">
                After
              </div>

              {/* Slider container */}
              <div
                ref={sliderRef}
                className="relative w-full aspect-square"
                onMouseDown={handleMouseDown}
                onTouchMove={handleTouchMove}
                onTouchStart={() => {}}
                style={{ cursor: "ew-resize" }}
              >
                {/* After image (full) */}
                <img
                  src={after}
                  alt="After Prismat"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />

                {/* Before image (clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={before}
                    alt="Before Prismat"
                    className="absolute inset-0  w-full h-full object-cover"
                    style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }}
                    draggable={false}
                  />
                </div>

                {/* Divider line */}
                <div
                  className="absolute inset-y-0 w-[2px] bg-white/90 z-10"
                  style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
                >
                  {/* Handle */}
                  <div className="slider-handle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg shadow-black/20 flex items-center justify-center">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-4 bg-[#ccc] rounded-full" />
                      <div className="w-0.5 h-4 bg-[#ccc] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[12px] text-[#bbb] mt-3 tracking-wide">Drag to compare</p>
          </div>
        </div>
      </section>

      {/* Feature chips */}
      <section className="px-8 max-w-6xl mx-auto pb-24">
        <div className="border-t border-[#e0e0e0] pt-12">
          <div className="flex flex-wrap gap-3">
            {["Non-destructive editing", "Prismatic color grading", "Batch processing", "Vector logo tools", "Export to SVG, PNG, PDF"].map((feat) => (
              <span
                key={feat}
                className="px-4 py-2 bg-white border border-[#e8e8e8] rounded-full text-[13px] text-[#666] font-light tracking-wide"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Second CTA section */}
      <section className="px-8 max-w-6xl mx-auto pb-32">
        <div className="bg-white rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm border border-[#ececec]">
          <div>
            <div className="spectrum-bar h-[2px] w-16 rounded-full mb-5" />
            <h2 className="text-[32px] font-light leading-tight text-[#1a1a1a] tracking-tight mb-2">
              Two tools.<br /><span className="font-semibold">One creative suite.</span>
            </h2>
            <p className="text-[15px] text-[#999] font-light max-w-xs">
              Edit photos with surgical precision or build logos that refract light — both in one place.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button className="btn-primary px-7 py-3.5 rounded-full bg-[#5ab6d4] text-white text-[15px] font-medium tracking-wide">
              Open Photo Editor
            </button>
            <button className="btn-secondary px-7 py-3.5 rounded-full border border-[#ccc] bg-transparent text-[#1a1a1a] text-[15px] font-medium tracking-wide hover:border-[#7ec8e3] transition-all">
              Open Logo Creator
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e0e0e0] px-8 py-8 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="prismat-logo-dot w-2 h-2 rounded-full" />
          <span className="text-[13px] text-[#aaa] tracking-widest uppercase">Prismat</span>
        </div>
        <p className="text-[12px] text-[#bbb]">2026 Prismat Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}