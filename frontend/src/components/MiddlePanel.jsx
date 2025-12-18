import React, { useMemo } from "react";
import { FileText } from "lucide-react";
import { colors } from "../theme/colors";
import StatusDot from "./ui/StatusDot";

/**
 * MiddlePanel Component
 *
 * Context-aware middle panel that displays different content based on current view
 * Mimics Discord's channel/DM list panel between server sidebar and chat area
 *
 * Props:
 * @param {string} currentView - Current active view (dashboard, checkin, certificates, ai)
 * @param {array} registrants - All participants
 * @param {function} onSelectParticipant - Callback when participant is clicked
 * @param {string} searchQuery - Current search query for filtering
 * @param {function} setSearchQuery - Update search query
 * @param {function} onOpenCertCustom - Open certificate customization modal
 * @param {function} onOpenPassCustom - Open pass customization modal
 */

const MiddlePanel = ({
  currentView,
  registrants = [],
  onSelectParticipant,
  searchQuery = "",
  setSearchQuery,
  onSelectCertAction,
  selectedCertAction,
}) => {
  // Filter registrants based on search query
  const filteredRegistrants = useMemo(() => {
    if (!searchQuery.trim()) return registrants;
    const query = searchQuery.toLowerCase();
    return registrants.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.phone?.toLowerCase().includes(query)
    );
  }, [registrants, searchQuery]);

  // Get content based on current view
  const getPanelContent = () => {
    switch (currentView) {
      case "dashboard":
        return renderParticipantList();
      case "checkin":
        return renderRecentCheckins();
      case "certificates":
        return renderEligibleList();
      case "ai":
        return renderGenerationHistory();
      default:
        return renderParticipantList();
    }
  };

  // Render participant list (for Dashboard)
  const renderParticipantList = () => {
    const sortedByStatus = [...filteredRegistrants].sort((a, b) => {
      const statusOrder = { admitted: 0, left_early: 1, pending: 2, absent: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          {sortedByStatus.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p style={{ color: colors.text.muted }} className="text-sm">
                {searchQuery ? "No participants found" : "No participants yet"}
              </p>
            </div>
          ) : (
            sortedByStatus.map((participant) => (
              <ParticipantListItem
                key={participant.id}
                participant={participant}
                onClick={() => onSelectParticipant?.(participant)}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  // Render recent check-ins (for Check-in view)
  const renderRecentCheckins = () => {
    const recentAdmitted = [...registrants]
      .filter((p) => p.status === "admitted")
      .sort((a, b) => new Date(b.admittedAt) - new Date(a.admittedAt))
      .slice(0, 50);

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          {recentAdmitted.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p style={{ color: colors.text.muted }} className="text-sm">
                No check-ins yet
              </p>
            </div>
          ) : (
            recentAdmitted.map((participant) => (
              <CheckinListItem
                key={participant.id}
                participant={participant}
                onClick={() => onSelectParticipant?.(participant)}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  // Render eligible participants (for Certificates view)
  const renderEligibleList = () => {
    const eligibleParticipants = filteredRegistrants.filter(
      (p) => p.status === "admitted" || p.status === "left_early"
    );

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          {eligibleParticipants.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p style={{ color: colors.text.muted }} className="text-sm">
                No eligible participants
              </p>
            </div>
          ) : (
            eligibleParticipants.map((participant) => (
              <CertificateListItem
                key={participant.id}
                participant={participant}
                onClick={() => onSelectParticipant?.(participant)}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  // Render generation history placeholder (for AI view)
  const renderGenerationHistory = () => {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="text-center py-8 px-4">
          <p style={{ color: colors.text.muted }} className="text-sm">
            AI generation history
          </p>
          <p style={{ color: colors.text.disabled }} className="text-xs mt-2">
            Coming soon
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        marginTop: 2.4,
        width: "302px",
        height: "calc(100% - 10px)",
        backgroundColor: colors.background.primary,
        borderRight: `1px solid ${colors.border.default}`,
      }}
    >
      {/* Search Bar - Replaces Header */}
      {(currentView === "dashboard" || currentView === "certificates") && (
        <div className="py-1 border-b shrink-0 flex items-center"
          style={{
            backgroundColor: colors.background.primary,
            borderColor: colors.border.default,
            paddingLeft: '3px',
            paddingRight: '3px',
          }}
        >
          <input
            type="text"
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            className="px-2 py-1.5 rounded-lg text-sm transition-colors duration-150 outline-none"
            style={{
              width: 'calc(100% - 6px)',
              margin: '3px',
              backgroundColor: colors.background.tertiary,
              color: colors.text.primary,
              border: `1px solid ${colors.border.default}`,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.border.focus;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border.default;
            }}
          />
        </div>
      )}

      {/* Customization List Items - Only Pass customization available */}
      {currentView === "certificates" && (
        <div className="px-2 pt-2 pb-2 shrink-0">
          <CustomizationListItem
            icon={<FileText size={16} />}
            label="Customize Pass"
            isSelected={selectedCertAction === "pass"}
            onClick={() => onSelectCertAction("pass")}
          />
        </div>
      )}

      {/* Content Area */}
      {getPanelContent()}
    </div>
  );
};

// Participant List Item Component
const ParticipantListItem = ({ participant, onClick }) => {
  const statusColor = participant.status === 'admitted' 
    ? colors.accent.green.DEFAULT 
    : participant.status === 'left_early'
    ? colors.accent.yellow.DEFAULT
    : participant.status === 'absent'
    ? colors.accent.red.DEFAULT
    : colors.accent.blurple.DEFAULT;

  return (
    <div
      className="px-2 py-2 rounded mb-1 cursor-pointer transition-all duration-150 relative"
      style={{
        backgroundColor: "transparent",
        borderLeft: `3px solid transparent`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.middlePanel.hover;
        e.currentTarget.style.borderLeftColor = statusColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.borderLeftColor = "transparent";
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <StatusDot status={participant.status} size="sm" />
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: colors.text.primary }}
          >
            {participant.name}
          </p>
          <p className="text-xs truncate" style={{ color: colors.text.muted }}>
            {participant.email}
          </p>
        </div>
      </div>
    </div>
  );
};

// Check-in List Item Component
const CheckinListItem = ({ participant, onClick }) => {
  const [currentTime] = React.useState(() => Date.now());
  const timeAgo = useMemo(() => {
    if (!participant.admittedAt) return "";
    const diff = currentTime - new Date(participant.admittedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }, [participant.admittedAt, currentTime]);

  const borderColor = participant.onSpot 
    ? colors.accent.yellow.DEFAULT 
    : colors.accent.green.DEFAULT;

  return (
    <div
      className="px-2 py-2 rounded mb-1 cursor-pointer transition-all duration-150 relative"
      style={{
        backgroundColor: "transparent",
        borderLeft: `3px solid transparent`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.middlePanel.hover;
        e.currentTarget.style.borderLeftColor = borderColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.borderLeftColor = "transparent";
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <StatusDot status={participant.status} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p
              className="text-sm font-medium truncate"
              style={{ color: colors.text.primary }}
            >
              {participant.name}
            </p>
            <span
              className="text-xs ml-2 shrink-0"
              style={{ color: colors.text.disabled }}
            >
              {timeAgo}
            </span>
          </div>
          {participant.onSpot && (
            <span
              className="text-xs px-1 py-0.5 rounded mt-0.5 inline-block"
              style={{
                backgroundColor: colors.accent.yellow.muted,
                color: colors.accent.yellow.DEFAULT,
              }}
            >
              On-spot
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Certificate List Item Component
const CertificateListItem = ({ participant, onClick }) => {
  const borderColor = participant.status === 'admitted' 
    ? colors.accent.green.DEFAULT 
    : colors.accent.yellow.DEFAULT;

  return (
    <div
      className="px-2 py-2 rounded mb-1 cursor-pointer transition-all duration-150 relative"
      style={{
        backgroundColor: "transparent",
        borderLeft: `3px solid transparent`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.middlePanel.hover;
        e.currentTarget.style.borderLeftColor = borderColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.borderLeftColor = "transparent";
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <StatusDot status={participant.status} size="sm" />
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: colors.text.primary }}
          >
            {participant.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {participant.certificateSent ? (
              <span className="text-xs" style={{ color: colors.status.online }}>
                ✓ Sent
              </span>
            ) : (
              <span className="text-xs" style={{ color: colors.text.muted }}>
                Pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Customization List Item Component (Discord-style)
const CustomizationListItem = ({ icon, label, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="px-2 py-2 rounded mb-1 cursor-pointer transition-colors duration-150 flex items-center gap-2"
      style={{
        backgroundColor: isSelected ? colors.background.hover : "transparent",
        borderLeft: isSelected
          ? `3px solid ${colors.accent.blurple.DEFAULT}`
          : "3px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor =
            colors.background.middlePanelHover;
          e.currentTarget.style.borderLeftColor = colors.accent.blurple.DEFAULT + '66';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderLeftColor = "transparent";
        }
      }}
    >
      <div style={{ color: colors.text.secondary }}>{icon}</div>
      <span
        className="text-sm font-medium"
        style={{
          color: isSelected ? colors.text.primary : colors.text.secondary,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default MiddlePanel;
