import React, { useState } from "react";
import {
  PlayCircle,
  Play,
  Pause,
  RotateCcw,
  Users,
  Clock,
  AlertCircle,
  FileDown,
  UploadCloud,
  UserMinus,
  LogOut,
  UserCheck,
  UserPlus,
  TrendingUp,
  BarChart3,
  Activity,
  Upload,
  ArrowUpRight,
  Send,
} from "lucide-react";
import { WORKSHOP_CAPACITY } from "../constants/constants";
import { parseCSV } from "../utils/csvParser";
import { colors } from "../theme/colors";

// Editable Time Segment Component
const EditableTimeSegment = ({ value, onChange, max, label }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    let newValue = parseInt(tempValue) || 0;
    if (max !== undefined) {
      newValue = Math.max(0, Math.min(max, newValue));
    } else {
      newValue = Math.max(0, newValue);
    }
    onChange(newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  React.useEffect(() => {
    setTempValue(value);
  }, [value]);

  if (isEditing) {
    return (
      <input
        type="number"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: 'transparent',
          borderBottom: `1px solid ${colors.border.focus}`,
          color: colors.text.primary,
        }}
        className="text-7xl font-mono font-bold w-32 text-center outline-none"
        autoFocus
        onFocus={(e) => e.target.select()}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer px-2 rounded transition-colors"
      style={{
        color: colors.text.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.background.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      title={`Click to edit ${label}`}
    >
      {value.toString().padStart(2, "0")}
    </span>
  );
};

// Compact Timer Component for Dashboard Profile Section
export const CompactTimer = ({
  workshopState,
  onStart,
  timeLeft,
  capacityReached,
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
  onPause,
  onReset,
}) => {
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (workshopState === "idle") {
    return (
      <div className="flex flex-col items-start gap-4 w-full">
        <div 
          className="rounded-lg p-4"
          style={{
            backgroundColor: colors.background.tertiary,
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <div className="text-4xl font-mono font-semibold flex items-center gap-2" style={{ color: colors.text.primary }}>
            <EditableTimeSegment
              value={durationHours}
              onChange={setDurationHours}
              label="hours"
            />
            <span>:</span>
            <EditableTimeSegment
              value={durationMinutes}
              onChange={setDurationMinutes}
              max={59}
              label="minutes"
            />
            <span>:</span>
            <span style={{ color: colors.text.muted }}>00</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onStart}
            disabled={capacityReached}
            className="inline-flex items-center px-4 py-2 font-semibold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: capacityReached ? colors.button.secondary.bg : colors.button.primary.bg,
              color: colors.button.primary.text,
              boxShadow: capacityReached ? 'none' : colors.glow.blurple,
            }}
            onMouseEnter={(e) => {
              if (!capacityReached) {
                e.currentTarget.style.backgroundColor = colors.button.primary.bgHover;
                e.currentTarget.style.boxShadow = `0 0 12px ${colors.accent.blurple.DEFAULT}66`;
              }
            }}
            onMouseLeave={(e) => {
              if (!capacityReached) {
                e.currentTarget.style.backgroundColor = colors.button.primary.bg;
                e.currentTarget.style.boxShadow = colors.glow.blurple;
              }
            }}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Workshop
          </button>
        </div>
      </div>
    );
  }
 
  if (workshopState === "active") {
    return (
      <div className="flex flex-col items-start gap-4 w-full">
        <div 
          className="rounded-lg p-4"
          style={{
            backgroundColor: colors.background.tertiary,
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <div className="text-4xl font-mono font-semibold" style={{ color: colors.text.primary }}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onPause}
            className="inline-flex items-center px-4 py-2 font-semibold rounded transition-all"
            style={{
              backgroundColor: colors.button.secondary.bg,
              color: colors.button.secondary.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.button.secondary.bgHover;
              e.currentTarget.style.boxShadow = `0 0 8px ${colors.button.secondary.bgHover}66`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.button.secondary.bg;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center px-4 py-2 font-semibold rounded transition-all"
            style={{
              backgroundColor: colors.button.danger.bg,
              color: colors.button.danger.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.button.danger.bgHover;
              e.currentTarget.style.boxShadow = colors.glow.red;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.button.danger.bg;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
      </div>
    );
  }

  if (workshopState === "finished") {
    return (
      <div className="flex flex-col items-start gap-4 w-full">
        <div 
          className="rounded-lg p-4"
          style={{
            backgroundColor: colors.background.tertiary,
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <div className="text-4xl font-mono font-semibold" style={{ color: colors.text.primary }}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="inline-flex items-center px-4 py-2 font-semibold rounded transition-all"
            style={{
              backgroundColor: colors.button.secondary.bg,
              color: colors.button.secondary.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.button.secondary.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.button.secondary.bg;
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Workshop
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// WorkshopControl Component - Removed duplicate timer, using CompactTimer only
export const WorkshopControl = () => {
  // This component is deprecated - timer functionality moved to CompactTimer
  // All parameters removed as they are unused
  return null;
};

// Legacy code removed to prevent duplicate timer display
const LegacyWorkshopControl_REMOVED = ({
  workshopState,
  onStart,
  timeLeft,
  capacityReached,
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
}) => {
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (workshopState === "idle") {
    return (
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Set Workshop Duration
        </h2>

        <div className="flex items-center space-x-4 mb-4">
          <div>
            <label
              htmlFor="duration-hours"
              className="block text-sm font-medium text-gray-700 text-center"
            >
              Hours
            </label>
            <input
              type="number"
              id="duration-hours"
              min="0"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="mt-1 block w-24 p-2 text-center border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <span className="text-2xl font-bold text-gray-500 pt-5">:</span>
          <div>
            <label
              htmlFor="duration-minutes"
              className="block text-sm font-medium text-gray-700 text-center"
            >
              Minutes
            </label>
            <input
              type="number"
              id="duration-minutes"
              min="0"
              max="59"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="mt-1 block w-24 p-2 text-center border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        <button
          onClick={onStart}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
        >
          <PlayCircle className="h-6 w-6 mr-2" />
          Start Workshop
        </button>
      </div>
    );
  }

  if (workshopState === "active") {
    if (capacityReached) {
      return (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-700">Workshop is Full!</h2>
          <p className="text-red-600 font-medium text-lg mt-1">
            Capacity of {WORKSHOP_CAPACITY} participants has been reached.
          </p>
          <p className="text-red-600">No more admissions are allowed.</p>
        </div>
      );
    }

    return (
      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Workshop is LIVE
        </h2>
        <p className="text-4xl font-bold text-gray-900 tracking-wider">
          {formatTime(timeLeft)}
        </p>
        <p className="text-sm text-gray-500">Time Remaining</p>
      </div>
    );
  }

  if (workshopState === "finished") {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-red-700">Workshop Finished</h2>
        <p className="text-red-600">
          Admissions are now closed. Absentees have been marked.
        </p>
      </div>
    );
  }

  return null;
};

// ErrorMessage Component
export const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center p-3 mt-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg text-yellow-800 animate-pulse-once">
      <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
      <p className="font-medium">{message}</p>
    </div>
  );
};

// AdmittedList Component
export const AdmittedList = ({ admittedPeople, totalCapacity }) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="h-7 w-7 mr-3 text-indigo-600" />
          Currently Admitted
        </h2>
        <span className="text-2xl font-bold text-gray-900 bg-gray-200 rounded-full px-4 py-1">
          {admittedPeople.length} / {totalCapacity}
        </span>
      </div>

      {admittedPeople.length === 0 ? (
        <div className="p-4 text-center bg-gray-50 border-2 border-gray-200 border-dashed rounded-lg">
          <p className="text-gray-500">No participants currently admitted.</p>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          {admittedPeople.map((person) => (
            <div
              key={person.id}
              className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              <span className="font-medium text-gray-800 mb-1 sm:mb-0">
                {person.name}
              </span>
              <span className="text-sm text-indigo-600 font-semibold flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                {person.admittedAt
                  ? new Date(person.admittedAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Kolkata",
                    })
                  : "N/A"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// AbsentList Component
export const AbsentList = ({ absentPeople }) => {
  if (absentPeople.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserMinus className="h-7 w-7 mr-3 text-red-600" />
          Absent
        </h2>
        <span className="text-2xl font-bold text-gray-900 bg-gray-200 rounded-full px-4 py-1">
          {absentPeople.length}
        </span>
      </div>
      <div className="max-h-60 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        {absentPeople.map((person) => (
          <div
            key={person.id}
            className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <span className="font-medium text-gray-800">{person.name}</span>
            <span
              className="text-sm text-gray-500 ml-2 wrap-break-word"
              title={person.email}
            >
              {person.email}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// EarlyLeaveList Component
export const EarlyLeaveList = ({ earlyLeavers }) => {
  if (earlyLeavers.length === 0) {
    return (
      <div className="mt-8 p-4 text-center bg-gray-50 border-2 border-gray-200 border-dashed rounded-lg">
        <p className="text-gray-500">No participants have left early.</p>
      </div>
    );
  }

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
      : "N/A";

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <LogOut className="h-7 w-7 mr-3 text-yellow-600" />
          Left Early
        </h2>
        <span className="text-2xl font-bold text-gray-900 bg-gray-200 rounded-full px-4 py-1">
          {earlyLeavers.length}
        </span>
      </div>
      <div className="max-h-60 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        {earlyLeavers.map((person) => (
          <div
            key={person.id}
            className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
              <span className="font-medium text-gray-800 mb-1 sm:mb-0">
                {person.name}
              </span>
              <span className="text-sm text-yellow-700 font-semibold flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                Left at: {formatTime(person.leftAt)}
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-1 border-l-2 border-gray-300">
              <span className="font-medium">Reason:</span>{" "}
              {person.leaveReason || "No reason provided."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// DataLoader Component
export const DataLoader = ({ onDataLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const parseFile = (file) => {
    setIsLoading(true);
    setParseError("");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const data = parseCSV(text);
        if (data.length === 0) {
          throw new Error("No valid participant data found in the file.");
        }
        onDataLoaded(data);
      } catch (err) {
        console.error(err);
        setParseError(err.message || "Failed to parse the file.");
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setParseError("Failed to read the file.");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      parseFile(file);
    } else {
      setParseError("Please drop a valid .csv file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8 bg-white border-b border-gray-200">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            Workshop Check-In System
          </h1>
          <p className="text-center text-gray-500 mt-2 text-sm">
            Created by Muneeb Basu
          </p>
        </div>

        <div className="p-10" onDrop={handleDrop} onDragOver={handleDragOver}>
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Load Participant Data
          </h2>

          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
              <p className="mb-2 text-lg font-semibold text-gray-700">
                <span className="text-indigo-600">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-sm text-gray-500">Please use the .CSV file</p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
          </label>

          {isLoading && (
            <p className="text-center text-lg font-medium text-indigo-600 mt-4 animate-pulse">
              Loading data...
            </p>
          )}

          {parseError && (
            <div className="flex items-center p-3 mt-4 bg-red-100 border-l-4 border-red-500 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
              <p className="font-medium">{parseError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// DownloadReports Component
export const DownloadReports = ({
  admitted,
  absentees,
  earlyLeavers,
  onDownloadAdmitted,
  onDownloadAbsentees,
  onDownloadEarlyLeavers,
}) => {
  return (
    <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Download Final Reports
      </h2>
      <div className="flex flex-col gap-4">
        <button
          onClick={onDownloadAdmitted}
          disabled={admitted.length === 0}
          className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 disabled:bg-gray-400"
        >
          <FileDown className="h-5 w-5 mr-2" />
          Download Admitted List ({admitted.length})
        </button>
        <button
          onClick={onDownloadAbsentees}
          disabled={absentees.length === 0}
          className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200 disabled:bg-gray-400"
        >
          <FileDown className="h-5 w-5 mr-2" />
          Download Absentee List ({absentees.length})
        </button>
        <button
          onClick={onDownloadEarlyLeavers}
          disabled={earlyLeavers.length === 0}
          className="w-full inline-flex items-center justify-center px-4 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-200 disabled:bg-gray-400"
        >
          <FileDown className="h-5 w-5 mr-2" />
          Download Early Leavers List ({earlyLeavers.length})
        </button>
      </div>
    </div>
  );
};

// Dashboard Component
export const Dashboard = ({
  // Workshop state
  workshopState,
  timeLeft,

  // Participant data
  registrants, // eslint-disable-line no-unused-vars
  admittedPeople,
  absentPeople,
  earlyLeavers,
  onSpotCount,
  totalCapacity,
  capacityReached,

  // Download handlers
  onDownloadAdmitted,
  onDownloadAbsentees,
  onDownloadEarlyLeavers,

  // Import handler
  onImportCSV,

  // Timer handlers
  onStartWorkshop,
  onPauseWorkshop,
  onResetWorkshop,
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,

  // Progress tracking
  passesSent = 0,
  passesFailed = 0,
  passesSending = false,
  certificatesSent = 0,
  certificatesFailed = 0,
  certificatesSending = false,
  eligibleForCertificate = 0,
}) => {
  const [activeTab, setActiveTab] = useState("admitted");

  const formatTimeOnly = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <div 
      className="-m-6 space-y-4 relative"
      style={{
        backgroundColor: colors.background.secondary,
      }}
    >
      {/* Top navbar - Discord style */}
      <div 
        className="h-[44.5px] sticky top-0 z-30 flex items-center justify-between px-6"
        style={{
          backgroundColor: 'transparent',
          borderBottom: `1px solid ${colors.border.default}`,
          marginLeft: '-24px',
          marginRight: '-24px',
          marginTop: '-24px',
        }}
      >
        {/* Left: Workshop Title/Breadcrumb */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>Dashboard</span>
          <span style={{ color: colors.text.muted }}>/</span>
          <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>Workshop</span>
        </div>

        {/* Center: Workshop Status Indicator */}
        <div className="flex items-center gap-2">
          <div 
            className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={{
              backgroundColor: workshopState === 'active' 
                ? colors.accent.green.muted
                : workshopState === 'finished'
                ? colors.accent.red.muted
                : colors.accent.blurple.muted,
              color: workshopState === 'active'
                ? colors.accent.green.DEFAULT
                : workshopState === 'finished'
                ? colors.accent.red.DEFAULT
                : colors.accent.blurple.DEFAULT,
              border: `1px solid ${
                workshopState === 'active'
                  ? colors.accent.green.DEFAULT + '4d'
                  : workshopState === 'finished'
                  ? colors.accent.red.DEFAULT + '4d'
                  : colors.accent.blurple.DEFAULT + '4d'
              }`,
            }}
          >
            <div 
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: workshopState === 'active'
                  ? colors.accent.green.DEFAULT
                  : workshopState === 'finished'
                  ? colors.accent.red.DEFAULT
                  : colors.accent.blurple.DEFAULT,
                boxShadow: workshopState === 'active'
                  ? colors.glow.green
                  : workshopState === 'finished'
                  ? colors.glow.red
                  : colors.glow.blurple,
              }}
            />
            {workshopState === 'active' ? 'Active' : workshopState === 'finished' ? 'Finished' : 'Idle'}
          </div>
        </div>

        {/* Right: Import CSV Button */}
        <button
          onClick={onImportCSV}
          className="w-8 h-8 mr-4 rounded-lg transition-all flex items-center justify-center"
          style={{
            backgroundColor: colors.button.secondary.bg,
            color: colors.button.secondary.text,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.button.secondary.bgHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.button.secondary.bg;
          }}
        >
          <Upload className="h-4 w-4" />
        </button>
      </div>
      
      <div className="px-6 overflow-x-hidden"
        style={{ paddingTop: '21.4px' }}
    >
      {/* Hero Section with Workshop Info and Timer */}
      <div 
        className="p-4"
      >
        <div className="text-left">
          {/* Workshop Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold mb-2" style={{ color: colors.text.primary }}>
              Mini Workshop on Physics
            </h1>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Plan, prioritize, and accomplish your workshop goals
            </p>
          </div>

          {/* Timer and Controls */}
          <CompactTimer
            workshopState={workshopState}
            onStart={onStartWorkshop}
            timeLeft={timeLeft}
            capacityReached={capacityReached}
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            onPause={onPauseWorkshop}
            onReset={onResetWorkshop}
          />


        </div>
      </div>

      {/* Main Dashboard Container */}
      <div className="space-y-4">

        {/* Statistics Bar - Single unified box */}
        <div 
          className="rounded-lg p-4"
          style={{
            backgroundColor: colors.background.secondary,
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <div className="grid grid-cols-4 gap-6">
            {/* Workshop Capacity */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-2 rounded transition-all"
                  style={{ 
                    backgroundColor: colors.accent.blurple.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent.blurple.DEFAULT + '33';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent.blurple.muted;
                  }}
                >
                  <Users className="h-4 w-4" style={{ color: colors.accent.blurple.DEFAULT }} />
                </div>
                <p className="text-xs font-medium" style={{ color: colors.text.muted }}>
                  Capacity
                </p>
              </div>
              <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                {admittedPeople.length}
                <span className="text-base ml-1" style={{ color: colors.text.muted }}>/ {totalCapacity}</span>
              </p>
            </div>

            {/* On-Spot */}
            <div className="flex flex-col items-start border-l pl-6" style={{ borderColor: colors.border.default }}>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-2 rounded transition-all"
                  style={{ 
                    backgroundColor: colors.accent.green.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent.green.DEFAULT + '33';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent.green.muted;
                  }}
                >
                  <UserPlus className="h-4 w-4" style={{ color: colors.accent.green.DEFAULT }} />
                </div>
                <p className="text-xs font-medium" style={{ color: colors.text.muted }}>
                  On-Spot
                </p>
              </div>
              <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                {onSpotCount}
              </p>
            </div>

            {/* Absent */}
            <div className="flex flex-col items-start border-l pl-6" style={{ borderColor: colors.border.default }}>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-2 rounded transition-all"
                  style={{ 
                    backgroundColor: colors.accent.red.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent.red.DEFAULT + '33';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent.red.muted;
                  }}
                >
                  <UserMinus className="h-4 w-4" style={{ color: colors.accent.red.DEFAULT }} />
                </div>
                <p className="text-xs font-medium" style={{ color: colors.text.muted }}>
                  Absent
                </p>
              </div>
              <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                {absentPeople.length}
              </p>
            </div>

            {/* Left Early */}
            <div className="flex flex-col items-start border-l pl-6" style={{ borderColor: colors.border.default }}>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-2 rounded transition-all"
                  style={{ 
                    backgroundColor: colors.accent.yellow.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent.yellow.DEFAULT + '33';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent.yellow.muted;
                  }}
                >
                  <LogOut className="h-4 w-4" style={{ color: colors.accent.yellow.DEFAULT }} />
                </div>
                <p className="text-xs font-medium" style={{ color: colors.text.muted }}>
                  Left Early
                </p>
              </div>
              <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                {earlyLeavers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity - Participant Avatar Grid */}
        <div 
          className="rounded-lg p-4"
          style={{
            backgroundColor: colors.background.secondary,
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text.primary }}>
                <Activity className="h-4 w-4" style={{ color: colors.text.secondary }} />
                Recent Check-ins
              </h2>
              <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
                Latest participants who joined the workshop
              </p>
            </div>
            <span 
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: colors.background.tertiary,
                color: colors.text.muted,
              }}
            >
              {admittedPeople.length} total
            </span>
          </div>

          {admittedPeople.length === 0 ? (
            <div className="text-center py-12">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all"
                style={{ 
                  background: colors.gradient.blurple,
                  boxShadow: colors.glow.blurple,
                }}
              >
                <Users className="h-8 w-8" style={{ color: '#ffffff' }} />
              </div>
              <p className="font-medium" style={{ color: colors.text.secondary }}>
                No participants checked in yet
              </p>
              <p className="text-sm mt-1" style={{ color: colors.text.muted }}>
                Check-ins will appear here as participants arrive
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {admittedPeople.slice(0, 12).map((person) => {
                const borderColor = person.onSpot 
                  ? colors.accent.yellow.DEFAULT 
                  : colors.accent.green.DEFAULT;
                return (
                  <div
                    key={person.id}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm mb-2 transition-all duration-200"
                      style={{
                        backgroundColor: colors.background.tertiary,
                        border: `2px solid ${borderColor}`,
                        color: colors.text.secondary,
                        boxShadow: `0 0 8px ${borderColor}33`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 12px ${borderColor}66`;
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 8px ${borderColor}33`;
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <p 
                      className="text-xs font-medium text-center truncate w-full px-1"
                      style={{ color: colors.text.secondary }}
                      title={person.name}
                    >
                      {person.name.split(' ')[0]}
                    </p>
                    {person.onSpot && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block font-medium"
                        style={{
                          backgroundColor: colors.accent.yellow.muted,
                          color: colors.accent.yellow.DEFAULT,
                          border: `1px solid ${colors.accent.yellow.DEFAULT}33`,
                        }}
                      >
                        On-Spot
                      </span>
                    )}
                    <p 
                      className="text-xs text-center"
                      style={{ color: colors.text.muted }}
                    >
                      {formatTimeOnly(person.admittedAt)}
                    </p>
                  </div>
                );
              })}
              {admittedPeople.length > 12 && (
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm mb-2"
                    style={{
                      backgroundColor: colors.background.tertiary,
                      border: `1px solid ${colors.border.default}`,
                      color: colors.text.muted,
                    }}
                  >
                    +{admittedPeople.length - 12}
                  </div>
                  <p className="text-xs" style={{ color: colors.text.muted }}>
                    more
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sending Progress Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
          {/* Sending Progress Card */}
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: colors.background.secondary,
              border: `1px solid ${colors.border.default}`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-2 rounded"
                style={{
                  backgroundColor: colors.background.tertiary,
                }}
              >
                <Send className="h-4 w-4" style={{ color: colors.text.secondary }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                  Sending Progress
                </h2>
                <p className="text-xs" style={{ color: colors.text.muted }}>
                  Passes and Certificates
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Passes Progress */}
              <div 
                className="p-3 rounded"
                style={{
                  backgroundColor: colors.background.tertiary,
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: colors.text.secondary }}>
                    Passes Sent
                  </span>
                  <span className="text-base font-semibold" style={{ color: colors.text.primary }}>
                    {passesSent} / {admittedPeople.length}
                  </span>
                </div>
                <div 
                  className="w-full rounded-full h-2 overflow-hidden"
                  style={{ backgroundColor: colors.background.quaternary }}
                >
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      backgroundColor: colors.status.online,
                      width: `${
                        admittedPeople.length > 0
                          ? Math.min(
                              (passesSent / admittedPeople.length) * 100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {passesSending && (
                    <p className="text-xs font-medium flex items-center gap-1" style={{ color: colors.status.online }}>
                      <span 
                        className="inline-block w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: colors.status.online }}
                      ></span>
                      Sending...
                    </p>
                  )}
                  {passesFailed > 0 && (
                    <p className="text-xs font-medium ml-auto" style={{ color: colors.status.dnd }}>
                      {passesFailed} failed
                    </p>
                  )}
                </div>
              </div>

              {/* Certificates Progress */}
              <div 
                className="p-3 rounded"
                style={{
                  backgroundColor: colors.background.tertiary,
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: colors.text.secondary }}>
                    Certificates Sent
                  </span>
                  <span className="text-base font-semibold" style={{ color: colors.text.primary }}>
                    {certificatesSent} / {eligibleForCertificate}
                  </span>
                </div>
                <div 
                  className="w-full rounded-full h-2 overflow-hidden"
                  style={{ backgroundColor: colors.background.quaternary }}
                >
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      backgroundColor: colors.accent.blurple.DEFAULT,
                      width: `${
                        eligibleForCertificate > 0
                          ? Math.min(
                              (certificatesSent / eligibleForCertificate) * 100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {certificatesSending && (
                    <p className="text-xs font-medium flex items-center gap-1" style={{ color: colors.accent.blurple.DEFAULT }}>
                      <span 
                        className="inline-block w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: colors.accent.blurple.DEFAULT }}
                      ></span>
                      Sending...
                    </p>
                  )}
                  {certificatesFailed > 0 && (
                    <p className="text-xs font-medium ml-auto" style={{ color: colors.status.dnd }}>
                      {certificatesFailed} failed
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: colors.background.secondary,
              border: `1px solid ${colors.border.default}`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-2 rounded"
                style={{
                  backgroundColor: colors.background.tertiary,
                }}
              >
                <FileDown className="h-4 w-4" style={{ color: colors.text.secondary }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>Quick Actions</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={onDownloadAdmitted}
                disabled={admittedPeople.length === 0}
                className="w-full flex items-center justify-between px-3 py-2 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (admittedPeople.length > 0) {
                    e.currentTarget.style.backgroundColor = colors.background.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="text-sm font-medium flex items-center gap-2" style={{ color: colors.text.secondary }}>
                  <FileDown className="h-4 w-4" />
                  Download Admitted
                </span>
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.muted
                  }}
                >
                  {admittedPeople.length}
                </span>
              </button>

              <button
                onClick={onDownloadAbsentees}
                disabled={absentPeople.length === 0}
                className="w-full flex items-center justify-between px-3 py-2 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (absentPeople.length > 0) {
                    e.currentTarget.style.backgroundColor = colors.background.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="text-sm font-medium flex items-center gap-2" style={{ color: colors.text.secondary }}>
                  <FileDown className="h-4 w-4" />
                  Download Absent
                </span>
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.muted
                  }}
                >
                  {absentPeople.length}
                </span>
              </button>

              <button
                onClick={onDownloadEarlyLeavers}
                disabled={earlyLeavers.length === 0}
                className="w-full flex items-center justify-between px-3 py-2 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (earlyLeavers.length > 0) {
                    e.currentTarget.style.backgroundColor = colors.background.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="text-sm font-medium flex items-center gap-2" style={{ color: colors.text.secondary }}>
                  <FileDown className="h-4 w-4" />
                  Download Early Leavers
                </span>
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.muted
                  }}
                >
                  {earlyLeavers.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Participant Lists - Tabbed Interface */}
        <div className="rounded-lg" style={{
          backgroundColor: colors.background.secondary,
          border: `1px solid ${colors.border.default}`,
        }}>
          {/* Tab Headers */}
          <div style={{ borderBottom: `1px solid ${colors.border.default}` }}>
            <div className="flex gap-8 px-4 pt-4">
              <button
                onClick={() => setActiveTab("admitted")}
                className={`px-1 py-3 text-sm font-medium relative transition-colors ${
                  activeTab === "admitted"
                    ? ""
                    : ""
                }`}
                style={{
                  color: activeTab === "admitted" ? colors.text.primary : colors.text.secondary,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "admitted") {
                    e.currentTarget.style.color = colors.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "admitted") {
                    e.currentTarget.style.color = colors.text.secondary;
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" style={{ color: activeTab === "admitted" ? colors.accent.green.DEFAULT : colors.text.secondary }} />
                  <span>Admitted</span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                    backgroundColor: activeTab === "admitted" ? colors.accent.green.muted : colors.background.tertiary,
                    color: activeTab === "admitted" ? colors.accent.green.DEFAULT : colors.text.muted
                  }}>
                    {admittedPeople.length}
                  </span>
                </div>
                {activeTab === "admitted" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all" style={{ backgroundColor: colors.accent.green.DEFAULT, boxShadow: colors.glow.green }}></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("absent")}
                className="px-1 py-3 text-sm font-medium relative transition-colors"
                style={{
                  color: activeTab === "absent" ? colors.text.primary : colors.text.secondary,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "absent") {
                    e.currentTarget.style.color = colors.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "absent") {
                    e.currentTarget.style.color = colors.text.secondary;
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <UserMinus className="h-4 w-4" style={{ color: activeTab === "absent" ? colors.accent.red.DEFAULT : colors.text.secondary }} />
                  <span>Absent</span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                    backgroundColor: activeTab === "absent" ? colors.accent.red.muted : colors.background.tertiary,
                    color: activeTab === "absent" ? colors.accent.red.DEFAULT : colors.text.muted
                  }}>
                    {absentPeople.length}
                  </span>
                </div>
                {activeTab === "absent" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all" style={{ backgroundColor: colors.accent.red.DEFAULT, boxShadow: colors.glow.red }}></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("earlyLeave")}
                className="px-1 py-3 text-sm font-medium relative transition-colors"
                style={{
                  color: activeTab === "earlyLeave" ? colors.text.primary : colors.text.secondary,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "earlyLeave") {
                    e.currentTarget.style.color = colors.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "earlyLeave") {
                    e.currentTarget.style.color = colors.text.secondary;
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" style={{ color: activeTab === "earlyLeave" ? colors.accent.yellow.DEFAULT : colors.text.secondary }} />
                  <span>Left Early</span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                    backgroundColor: activeTab === "earlyLeave" ? colors.accent.yellow.muted : colors.background.tertiary,
                    color: activeTab === "earlyLeave" ? colors.accent.yellow.DEFAULT : colors.text.muted
                  }}>
                    {earlyLeavers.length}
                  </span>
                </div>
                {activeTab === "earlyLeave" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all" style={{ backgroundColor: colors.accent.yellow.DEFAULT, boxShadow: colors.glow.yellow }}></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "admitted" && (
              <div>
                {admittedPeople.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.background.tertiary }}>
                      <UserCheck className="h-8 w-8" style={{ color: colors.text.disabled }} />
                    </div>
                    <p className="font-medium" style={{ color: colors.text.secondary }}>
                      No participants admitted yet
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.text.muted }}>
                      Admitted participants will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {admittedPeople.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-3 p-3 rounded transition-colors group relative"
                        style={{
                          backgroundColor: 'transparent',
                          borderLeft: `3px solid ${colors.accent.green.DEFAULT}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.background.hover;
                          e.currentTarget.style.borderLeftColor = colors.accent.green.DEFAULT;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderLeftColor = colors.accent.green.DEFAULT;
                        }}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm shrink-0 transition-all" style={{
                          backgroundColor: colors.accent.green.muted,
                          border: `2px solid ${colors.accent.green.DEFAULT}`,
                          color: colors.accent.green.DEFAULT
                        }}>
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium" style={{ color: colors.text.primary }}>
                            {person.name}
                          </p>
                          <p className="text-sm truncate" style={{ color: colors.text.muted }}>
                            {person.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs mb-0.5" style={{ color: colors.text.muted }}>
                            Admitted at
                          </p>
                          <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            {formatTimeOnly(person.admittedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "absent" && (
              <div>
                {absentPeople.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.background.tertiary }}>
                      <UserMinus className="h-8 w-8" style={{ color: colors.text.disabled }} />
                    </div>
                    <p className="font-medium" style={{ color: colors.text.secondary }}>
                      No absent participants
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.text.muted }}>
                      All registered participants are present
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {absentPeople.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-3 p-3 rounded transition-colors relative"
                        style={{
                          backgroundColor: 'transparent',
                          borderLeft: `3px solid ${colors.accent.red.DEFAULT}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.background.hover;
                          e.currentTarget.style.borderLeftColor = colors.accent.red.DEFAULT;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderLeftColor = colors.accent.red.DEFAULT;
                        }}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm shrink-0 transition-all" style={{
                          backgroundColor: colors.accent.red.muted,
                          border: `2px solid ${colors.accent.red.DEFAULT}`,
                          color: colors.accent.red.DEFAULT
                        }}>
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium" style={{ color: colors.text.primary }}>
                            {person.name}
                          </p>
                          <p className="text-sm truncate" style={{ color: colors.text.muted }}>
                            {person.email}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{
                          backgroundColor: colors.background.tertiary,
                          color: colors.text.muted
                        }}>
                          Absent
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "earlyLeave" && (
              <div>
                {earlyLeavers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.background.tertiary }}>
                      <LogOut className="h-8 w-8" style={{ color: colors.text.disabled }} />
                    </div>
                    <p className="font-medium" style={{ color: colors.text.secondary }}>
                      No early departures
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.text.muted }}>
                      Participants who left early will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {earlyLeavers.map((person) => (
                      <div
                        key={person.id}
                        className="p-3 rounded transition-colors relative"
                        style={{
                          backgroundColor: 'transparent',
                          borderLeft: `3px solid ${colors.accent.yellow.DEFAULT}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.background.hover;
                          e.currentTarget.style.borderLeftColor = colors.accent.yellow.DEFAULT;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderLeftColor = colors.accent.yellow.DEFAULT;
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm shrink-0 transition-all" style={{
                            backgroundColor: colors.accent.yellow.muted,
                            border: `2px solid ${colors.accent.yellow.DEFAULT}`,
                            color: colors.accent.yellow.DEFAULT
                          }}>
                            {person.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium" style={{ color: colors.text.primary }}>
                              {person.name}
                            </p>
                            <p className="text-sm truncate" style={{ color: colors.text.muted }}>
                              {person.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs mb-0.5" style={{ color: colors.text.muted }}>
                              Left at
                            </p>
                            <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                              {formatTimeOnly(person.leftAt)}
                            </p>
                          </div>
                        </div>
                        <div className="pl-13 pr-3">
                          <div className="p-2 rounded" style={{
                            backgroundColor: colors.background.tertiary,
                            border: `1px solid ${colors.border.default}`
                          }}>
                            <p className="text-xs mb-1" style={{ color: colors.text.muted }}>
                              Reason for leaving:
                            </p>
                            <p className="text-sm" style={{ color: colors.text.secondary }}>
                              {person.leaveReason || "No reason provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
