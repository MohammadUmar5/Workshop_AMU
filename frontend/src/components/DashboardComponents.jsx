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
          borderBottom: `2px solid ${colors.accent.blurple.DEFAULT}`,
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
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="text-7xl font-mono font-bold text-white tracking-wider flex items-center gap-2">
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
          <span className="opacity-50">00</span>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={onStart}
            disabled={capacityReached}
            className="relative inline-flex items-center px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            style={{
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(88, 101, 242, 0.3)',
            }}
          >
            <span className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" 
              style={{
                animation: 'rotate-gradient 3s linear infinite',
                backgroundSize: '200% 200%',
              }}
            />
            <span className="absolute inset-[2px] rounded-full bg-white" />
            <Play className="h-4 w-4 mr-2 relative z-10 fill-current" />
            <span className="relative z-10">Start Workshop</span>
          </button>
        </div>
        <style>{`
          @keyframes rotate-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    );
  }

  if (workshopState === "active") {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="text-7xl font-mono font-bold text-white tracking-wider">
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onPause}
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            }}
          >
            <Pause className="h-5 w-5 mr-2" />
            Pause
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: 'rgba(237, 66, 69, 0.8)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(237, 66, 69, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(237, 66, 69, 0.8)';
            }}
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </button>
        </div>
      </div>
    );
  }

  if (workshopState === "finished") {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="text-7xl font-mono font-bold text-white tracking-wider">
          {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            }}
          >
            <RotateCcw className="h-5 w-5 mr-2" />
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
      className="-m-6 space-y-4"
      style={{
        background: 'linear-gradient(to bottom, #c74ddb 0%, #b84dcf 10%, #a855f7 20%, rgba(168, 85, 247, 0.7) 23%, rgba(147, 51, 234, 0.5) 27%, rgba(139, 92, 246, 0.2) 32%, transparent 35%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Top blur bar - aligns with MiddlePanel header */}
      <div 
        className="h-[45.4px] sticky top-0 z-20 flex items-center justify-end px-6"
        style={{
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          onClick={onImportCSV}
          className="px-4 py-2 mt-2.5 text-sm font-semibold text-white rounded-lg transition-all flex items-center gap-2 hover:scale-105"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <Upload className="h-4 w-4" />
          Import CSV
        </button>
      </div>
      
      <div className="px-6"
    >
      {/* Hero Section with Workshop Info and Timer */}
      <div 
        className="rounded-xl p-8 relative overflow-hidden"
      >
        {/* Decorative gradient overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.3), transparent 50%)',
          }}
        />
        
        <div className="relative z-10 text-center">
          {/* Workshop Title */}
          <div className="mb-8">
            <h1 className="text-6xl font-black text-white mb-4 uppercase italic tracking-wide" style={{ fontFamily: '"BBH Hegarty", sans-serif',fontWeight: '400' }}>
              Mini Workshop on Physics
            </h1>
            <p className="text-white/80 text-xl">
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
      <div className="space-y-6">

        {/* Statistics Bar - Single unified box */}
        <div 
          className="rounded-xl p-6"
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
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: '#5865f220' }}
                >
                  <Users className="h-5 w-5" style={{ color: '#5865f2' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.text.secondary }}>
                  Capacity
                </p>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                {admittedPeople.length}
                <span className="text-lg ml-1" style={{ color: colors.text.muted }}>/ {totalCapacity}</span>
              </p>
            </div>

            {/* On-Spot */}
            <div className="flex flex-col items-start border-l pl-6" style={{ borderColor: colors.border.default }}>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${colors.status.online}20` }}
                >
                  <UserPlus className="h-5 w-5" style={{ color: colors.status.online }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.text.secondary }}>
                  On-Spot
                </p>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                {onSpotCount}
              </p>
            </div>

            {/* Absent */}
            <div className="flex flex-col items-start border-l pl-6" style={{ borderColor: colors.border.default }}>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${colors.status.dnd}20` }}
                >
                  <UserMinus className="h-5 w-5" style={{ color: colors.status.dnd }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.text.secondary }}>
                  Absent
                </p>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                {absentPeople.length}
              </p>
            </div>

            {/* Left Early */}
            <div className="flex flex-col items-start border-l pl-6" style={{ borderColor: colors.border.default }}>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${colors.status.idle}20` }}
                >
                  <LogOut className="h-5 w-5" style={{ color: colors.status.idle }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.text.secondary }}>
                  Left Early
                </p>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                {earlyLeavers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity - Participant Avatar Grid */}
        <div 
          className="p-6 rounded-xl"
          style={{
            backgroundColor: colors.background.secondary,
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5" style={{ color: colors.accent.blurple.DEFAULT }} />
                Recent Check-ins
              </h2>
              <p className="text-sm mt-1" style={{ color: colors.text.muted }}>
                Latest participants who joined the workshop
              </p>
            </div>
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: `${colors.accent.blurple.DEFAULT}20`,
                color: colors.accent.blurple.DEFAULT,
              }}
            >
              {admittedPeople.length} total
            </span>
          </div>

          {admittedPeople.length === 0 ? (
            <div className="text-center py-12">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ backgroundColor: colors.background.tertiary }}
              >
                <Users className="h-8 w-8" style={{ color: colors.text.disabled }} />
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
              {admittedPeople.slice(0, 12).map((person, index) => {
                const colors_list = [
                  '#5865f2', '#3ba55d', '#faa61a', '#ed4245', 
                  '#9b59b6', '#1abc9c', '#e91e63', '#00bcd4'
                ];
                const bgColor = colors_list[index % colors_list.length];
                
                return (
                  <div
                    key={person.id}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2 transform transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        backgroundColor: bgColor,
                        boxShadow: `0 4px 12px ${bgColor}40`,
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
                    <p 
                      className="text-xs text-center"
                      style={{ color: colors.text.disabled }}
                    >
                      {formatTimeOnly(person.admittedAt)}
                    </p>
                  </div>
                );
              })}
              {admittedPeople.length > 12 && (
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2"
                    style={{
                      backgroundColor: colors.background.tertiary,
                      border: `2px dashed ${colors.border.default}`,
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
            className="p-6 rounded-xl"
            style={{
              backgroundColor: colors.background.secondary,
              border: `1px solid ${colors.border.default}`,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: `${colors.accent.blurple.DEFAULT}20`,
                }}
              >
                <Send className="h-5 w-5" style={{ color: colors.accent.blurple.DEFAULT }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Sending Progress
                </h2>
                <p className="text-sm" style={{ color: colors.text.muted }}>
                  Passes and Certificates
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Passes Progress */}
              <div 
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${colors.status.online}15`,
                  border: `1px solid ${colors.status.online}40`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: colors.status.online }}>
                    Passes Sent
                  </span>
                  <span className="text-lg font-bold text-white font-mono">
                    {passesSent} / {admittedPeople.length}
                  </span>
                </div>
                <div 
                  className="w-full rounded-full h-3 overflow-hidden"
                  style={{ backgroundColor: colors.background.tertiary }}
                >
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${colors.status.online} 0%, #2d7d46 100%)`,
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
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${colors.accent.blurple.DEFAULT}15`,
                  border: `1px solid ${colors.accent.blurple.DEFAULT}40`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: colors.accent.blurple.DEFAULT }}>
                    Certificates Sent
                  </span>
                  <span className="text-lg font-bold text-white font-mono">
                    {certificatesSent} / {eligibleForCertificate}
                  </span>
                </div>
                <div 
                  className="w-full rounded-full h-3 overflow-hidden"
                  style={{ backgroundColor: colors.background.tertiary }}
                >
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${colors.accent.blurple.DEFAULT} 0%, #4752c4 100%)`,
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
            className="p-6 rounded-xl"
            style={{
              backgroundColor: colors.background.secondary,
              border: `1px solid ${colors.border.default}`,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: `${colors.accent.blurple.DEFAULT}20`,
                }}
              >
                <FileDown className="h-5 w-5" style={{ color: colors.accent.blurple.DEFAULT }} />
              </div>
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={onDownloadAdmitted}
                disabled={admittedPeople.length === 0}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{
                  backgroundColor: colors.background.tertiary,
                  border: `1px solid ${colors.border.default}`,
                }}
                onMouseEnter={(e) => {
                  if (admittedPeople.length > 0) {
                    e.currentTarget.style.borderColor = colors.status.online;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.default;
                }}
              >
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Download Admitted
                </span>
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: colors.status.online }}
                >
                  {admittedPeople.length}
                </span>
              </button>

              <button
                onClick={onDownloadAbsentees}
                disabled={absentPeople.length === 0}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{
                  backgroundColor: colors.background.tertiary,
                  border: `1px solid ${colors.border.default}`,
                }}
                onMouseEnter={(e) => {
                  if (absentPeople.length > 0) {
                    e.currentTarget.style.borderColor = colors.status.dnd;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.default;
                }}
              >
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Download Absent
                </span>
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: colors.status.dnd }}
                >
                  {absentPeople.length}
                </span>
              </button>

              <button
                onClick={onDownloadEarlyLeavers}
                disabled={earlyLeavers.length === 0}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{
                  backgroundColor: colors.background.tertiary,
                  border: `1px solid ${colors.border.default}`,
                }}
                onMouseEnter={(e) => {
                  if (earlyLeavers.length > 0) {
                    e.currentTarget.style.borderColor = colors.status.idle;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.default;
                }}
              >
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Download Early Leavers
                </span>
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: colors.status.idle }}
                >
                  {earlyLeavers.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Participant Lists - Tabbed Interface */}
        <div className="bg-black rounded-lg">
          {/* Tab Headers */}
          <div className="border-b border-[#2a2a2a]">
            <div className="flex gap-8 px-4 pt-4">
              <button
                onClick={() => setActiveTab("admitted")}
                className={`px-1 py-3 text-sm font-medium relative transition-colors ${
                  activeTab === "admitted"
                    ? "text-white"
                    : "text-[#b9bbbe] hover:text-[#dcddde]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Admitted</span>
                  <span className="bg-[#000000] px-2 py-0.5 rounded text-xs font-semibold">
                    {admittedPeople.length}
                  </span>
                </div>
                {activeTab === "admitted" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5865f2]"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("absent")}
                className={`px-1 py-3 text-sm font-medium relative transition-colors ${
                  activeTab === "absent"
                    ? "text-white"
                    : "text-[#b9bbbe] hover:text-[#dcddde]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserMinus className="h-4 w-4" />
                  <span>Absent</span>
                  <span className="bg-[#000000] px-2 py-0.5 rounded text-xs font-semibold">
                    {absentPeople.length}
                  </span>
                </div>
                {activeTab === "absent" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5865f2]"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("earlyLeave")}
                className={`px-1 py-3 text-sm font-medium relative transition-colors ${
                  activeTab === "earlyLeave"
                    ? "text-white"
                    : "text-[#b9bbbe] hover:text-[#dcddde]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Left Early</span>
                  <span className="bg-[#000000] px-2 py-0.5 rounded text-xs font-semibold">
                    {earlyLeavers.length}
                  </span>
                </div>
                {activeTab === "earlyLeave" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5865f2]"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "admitted" && (
              <div>
                {admittedPeople.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#000000] rounded-full mb-4">
                      <UserCheck className="h-8 w-8 text-[#72767d]" />
                    </div>
                    <p className="text-[#dcddde] font-medium">
                      No participants admitted yet
                    </p>
                    <p className="text-sm text-[#72767d] mt-1">
                      Admitted participants will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {admittedPeople.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-4 p-4 bg-[#000000] hover:bg-[#1a1a1a] rounded-lg transition-colors group"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-[#3ba55d] to-[#2d7d46] rounded-full text-white font-bold text-sm shrink-0">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#dcddde]">
                            {person.name}
                          </p>
                          <p className="text-sm text-[#72767d] truncate">
                            {person.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#72767d] mb-0.5">
                            Admitted at
                          </p>
                          <p className="text-sm font-semibold text-[#3ba55d]">
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <UserMinus className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No absent participants
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      All registered participants are present
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {absentPeople.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-red-500 to-pink-600 rounded-full text-white font-bold text-sm shrink-0">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">
                            {person.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {person.email}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <LogOut className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No early departures
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Participants who left early will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {earlyLeavers.map((person) => (
                      <div
                        key={person.id}
                        className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-amber-500 to-orange-600 rounded-full text-white font-bold text-sm shrink-0">
                            {person.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">
                              {person.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {person.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-0.5">
                              Left at
                            </p>
                            <p className="text-sm font-semibold text-amber-600">
                              {formatTimeOnly(person.leftAt)}
                            </p>
                          </div>
                        </div>
                        <div className="pl-14 pr-4">
                          <div className="bg-white border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                              Reason for leaving:
                            </p>
                            <p className="text-sm text-gray-700">
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
