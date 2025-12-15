import React from "react";
import {
  Search,
  UserPlus,
  LogOut,
  Sparkles,
  Award,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Settings,
  UserCheck,
  UserX,
  ArrowRight,
} from "lucide-react";
import { colors } from "../theme/colors";
import AstroImage from "../assets/Astro.png";

export const Sidebar = ({
  currentView,
  setCurrentView,
  workshopState,
  setActiveSubView,
}) => {
  return (
    <div
      className="flex flex-col items-center p-0 shrink-0 mt-9"
      style={{
        width: "50px",
        height: "calc(100vh - 2.25rem - 24px)",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      {/* App Icon/Home */}
      <HomeIcon
        isActive={currentView === "dashboard"}
        onClick={() => setCurrentView("dashboard")}
      />

      {/* Separator */}
      <div
        className="w-8 h-0.5 mb-2"
        style={{ backgroundColor: colors.border.default }}
      />

      {/* Navigation Icons */}
      <nav
        className="flex-1 space-y-2 overflow-y-auto"
        style={{ overflow: "visible" }}
      >
        {/* Check-in */}
        <NavIcon
          icon={<Search className="w-6 h-6" />}
          isActive={currentView === "checkin"}
          onClick={() => {
            setCurrentView("checkin");
            if (setActiveSubView) setActiveSubView("checkin");
          }}
          iconColor="#000000"
          // label="Check-in"
        />

        {/* AI Tools */}
        <NavIcon
          icon={<Sparkles className="w-6 h-6" />}
          isActive={currentView === "ai"}
          onClick={() => setCurrentView("ai")}
          iconColor="url(#aiGradient)"
          // label="AI Tools"
        />

        {/* Certificates - only show when workshop finished */}
        {workshopState === "finished" && (
          <NavIcon
            icon={<Award className="w-6 h-6" />}
            isActive={currentView === "certificates"}
            onClick={() => setCurrentView("certificates")}
            // label="Certificates"
          />
        )}
      </nav>

      {/* Profile Box at bottom */}
      <div className="mt-auto pt-3 flex flex-col items-center gap-2">
        {/* Profile Image Box */}
        <button
          className="w-12 h-12 flex items-center justify-center transition-all duration-150 overflow-hidden"
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            border: `2px solid ${colors.border.default}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.accent.blurple.DEFAULT;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border.default;
          }}
          title="Admin"
        >
          <svg viewBox="0 0 768 768" className="w-8 h-8">
            <path
              fill="#1a1a1a"
              d="M384 149.333c-129.387 0-234.667 105.28-234.667 234.667s105.28 234.667 234.667 234.667 234.667-105.28 234.667-234.667-105.28-234.667-234.667-234.667zm0 42.667c106.027 0 192 85.973 192 192s-85.973 192-192 192-192-85.973-192-192 85.973-192 192-192z"
            />
            <circle fill="#1a1a1a" cx="384" cy="384" r="138.667" />
            <ellipse cx="426.667" cy="352" rx="32" ry="42.667" fill="white" />
            <path
              fill="#1a1a1a"
              d="M192 320c0-17.673 14.327-32 32-32h32c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32h-32c-17.673 0-32-14.327-32-32v-64z"
            />
            <path
              fill="#1a1a1a"
              d="M512 320c0-17.673 14.327-32 32-32h32c17.673 0 32 14.327 32 32v64c0 17.673-14.327 32-32 32h-32c-17.673 0-32-14.327-32-32v-64z"
            />
            <circle fill="#1a1a1a" cx="563.2" cy="166.4" r="21.333" />
            <path
              fill="#1a1a1a"
              stroke="#1a1a1a"
              strokeWidth="8"
              d="M533.333 192l42.667-85.333"
            />
            <path fill="#1a1a1a" d="M192 512h-42.667v85.333h85.333v-42.667z" />
            <path fill="#1a1a1a" d="M576 512h42.667v85.333h-85.333v-42.667z" />
            <path fill="#1a1a1a" d="M234.667 597.333h-21.333v21.333h21.333z" />
            <path fill="#1a1a1a" d="M554.667 597.333h21.333v21.333h-21.333z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// NavIcon Component for circular navigation buttons
const NavIcon = ({ icon, isActive, onClick, iconColor }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const buttonRef = React.useRef(null);
  const [barPosition, setBarPosition] = React.useState(0);

  React.useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setBarPosition(rect.top + 8); // 8px offset to center with button
    }
  }, [isHovered, isActive]);

  return (
    <div className="relative">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>

      {/* Hover and Active indicator bar */}
      {(isHovered || isActive) && (
        <div
          className="fixed w-1 h-8 rounded-r-full transition-all duration-150"
          style={{
            backgroundColor: colors.text.primary,
            zIndex: 10,
            left: 0,
            top: `${barPosition}px`,
          }}
        />
      )}

      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-12 h-12 flex items-center justify-center transition-all duration-150"
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          stroke: iconColor || colors.text.primary,
        }}
      >
        <div
          style={{ color: iconColor || colors.text.primary, display: "flex" }}
        >
          {icon}
        </div>
      </button>
    </div>
  );
};

// HomeIcon Component for the dashboard/home button
const HomeIcon = ({ isActive, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const buttonRef = React.useRef(null);
  const [barPosition, setBarPosition] = React.useState(0);

  React.useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setBarPosition(rect.top + 8);
    }
  }, [isHovered, isActive]);

  return (
    <div className="mb-2 relative">
      {/* Hover and Active indicator bar */}
      {(isHovered || isActive) && (
        <div
          className="fixed w-1 h-8 rounded-r-full transition-all duration-150"
          style={{
            backgroundColor: colors.text.primary,
            zIndex: 10,
            left: 0,
            top: `${barPosition}px`,
          }}
        />
      )}

      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-12 h-12 flex items-center justify-center transition-all duration-150"
        style={{
          backgroundColor: "white",
          color: colors.text.primary,
          borderRadius: "16px",
        }}
        title="Dashboard"
      >
        <img src={AstroImage} alt="Dashboard" className="w-14 h-13" />
      </button>
    </div>
  );
};
