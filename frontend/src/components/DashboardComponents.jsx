import React, { useState } from "react";
import {
  PlayCircle,
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
  UserCircle,
} from "lucide-react";
import { WORKSHOP_CAPACITY } from "../constants/constants";
import { parseCSV } from "../utils/csvParser";

// WorkshopControl Component
export const WorkshopControl = ({
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
  workshopEndTime,

  // Participant data
  registrants,
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

  const totalRegistered = registrants.length;

  return (
    <div className="-m-6 px-6 py-2 space-y-2">
      {/* Profile Section Container */}
      <div className="bg-gray-100 rounded-2xl p-2">
        <div className="flex items-center justify-end">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
            <UserCircle className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Container with Gray Background */}
      <div className="bg-gray-100 rounded-2xl p-6 space-y-2">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Plan, prioritize, and accomplish your workshop goals
            </p>
          </div>
          <button
            onClick={onImportCSV}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
        </div>

        {/* Step 1: Statistics Cards - Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          {/* Total Registered */}
          <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">
                Total Registered
              </p>
              <div className="p-2 rounded-full border border-gray-400">
                <ArrowUpRight className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-mono">
              {totalRegistered}
            </p>
          </div>

          {/* Currently Admitted - Highlighted Card */}
          <div className="bg-linear-to-br from-pink-500 to-yellow-600 border p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white/90">Admitted</p>
              <div className="p-2 rounded-full border border-white">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              {admittedPeople.length}
              <span className="text-lg text-white/70 ml-1 font-mono">
                / {totalCapacity}
              </span>
            </p>
          </div>

          {/* On-Spot Registrations */}
          <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">On-Spot</p>
              <div className="p-2 rounded-full border-2 border-gray-300">
                <ArrowUpRight className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-mono">
              {onSpotCount}
            </p>
          </div>

          {/* Absent */}
          <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow ">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <div className="p-2 rounded-full border-2 border-gray-300">
                <ArrowUpRight className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-mono">
              {absentPeople.length}
            </p>
          </div>

          {/* Left Early */}
          <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow ">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Left Early</p>
              <div className="p-2 rounded-full border-2 border-gray-300">
                <ArrowUpRight className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 font-mono">
              {earlyLeavers.length}
            </p>
          </div>
        </div>

        {/* Step 2: Sending Progress Stats - NEW */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-2">
          {/* Sending Progress Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Sending Progress
                </h2>
                <p className="text-xs text-gray-500">Passes and Certificates</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Passes Progress */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-green-900">
                    Passes Sent
                  </span>
                  <span className="text-lg font-bold text-green-900 font-mono">
                    {passesSent} / {admittedPeople.length}
                  </span>
                </div>
                <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{
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
                    <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                      Sending...
                    </p>
                  )}
                  {passesFailed > 0 && (
                    <p className="text-xs text-red-600 font-medium ml-auto">
                      {passesFailed} failed
                    </p>
                  )}
                </div>
              </div>

              {/* Certificates Progress */}
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-900">
                    Certificates Sent
                  </span>
                  <span className="text-lg font-bold text-blue-900 font-mono">
                    {certificatesSent} / {eligibleForCertificate}
                  </span>
                </div>
                <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                    style={{
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
                    <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                      Sending...
                    </p>
                  )}
                  {certificatesFailed > 0 && (
                    <p className="text-xs text-red-600 font-medium ml-auto">
                      {certificatesFailed} failed
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel - Compact */}
          <div className="bg-black p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5" />
              <h2 className="text-lg font-bold">Quick Actions</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={onDownloadAdmitted}
                disabled={admittedPeople.length === 0}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-medium">Download Admitted</span>
                <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-semibold">
                  {admittedPeople.length}
                </span>
              </button>

              <button
                onClick={onDownloadAbsentees}
                disabled={absentPeople.length === 0}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-medium">Download Absent</span>
                <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-semibold">
                  {absentPeople.length}
                </span>
              </button>

              <button
                onClick={onDownloadEarlyLeavers}
                disabled={earlyLeavers.length === 0}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-medium">
                  Download Early Leavers
                </span>
                <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-semibold">
                  {earlyLeavers.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Participant Lists - Tabbed Interface */}
        <div className="bg-white rounded-2xl shadow-sm ">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab("admitted")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === "admitted"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Admitted</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-full text-xs font-bold">
                    {admittedPeople.length}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("absent")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === "absent"
                    ? "bg-red-100 text-red-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserMinus className="h-4 w-4" />
                  <span>Absent</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-full text-xs font-bold">
                    {absentPeople.length}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("earlyLeave")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === "earlyLeave"
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Left Early</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-full text-xs font-bold">
                    {earlyLeavers.length}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "admitted" && (
              <div>
                {admittedPeople.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <UserCheck className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No participants admitted yet
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Admitted participants will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {admittedPeople.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-green-500 to-emerald-600 rounded-full text-white font-bold text-sm shrink-0">
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
                            Admitted at
                          </p>
                          <p className="text-sm font-semibold text-green-600">
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
  );
};
