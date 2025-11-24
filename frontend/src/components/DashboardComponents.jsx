import React, { useState } from 'react';
import {
  PlayCircle,
  Users,
  Clock,
  AlertCircle,
  FileDown,
  UploadCloud,
  UserMinus,
  LogOut
} from 'lucide-react';
import { WORKSHOP_CAPACITY } from '../constants/constants';
import { parseCSV } from '../utils/csvParser';

// WorkshopControl Component
export const WorkshopControl = ({ 
  workshopState, 
  onStart, 
  timeLeft, 
  capacityReached,
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes
}) => {
  
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (workshopState === 'idle') {
    return (
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Set Workshop Duration</h2>
        
        <div className="flex items-center space-x-4 mb-4">
          <div>
            <label htmlFor="duration-hours" className="block text-sm font-medium text-gray-700 text-center">Hours</label>
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
            <label htmlFor="duration-minutes" className="block text-sm font-medium text-gray-700 text-center">Minutes</label>
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
  
  if (workshopState === 'active') {
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
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Workshop is LIVE</h2>
        <p className="text-4xl font-bold text-blue-600 tracking-wider">
          {formatTime(timeLeft)}
        </p>
        <p className="text-sm text-blue-500">Time Remaining</p>
      </div>
    );
  }
  
  if (workshopState === 'finished') {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-red-700">Workshop Finished</h2>
        <p className="text-red-600">Admissions are now closed. Absentees have been marked.</p>
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
      <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
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
            <div key={person.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <span className="font-medium text-gray-800 mb-1 sm:mb-0">{person.name}</span>
              <span className="text-sm text-indigo-600 font-semibold flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                {person.admittedAt 
                  ? new Date(person.admittedAt).toLocaleTimeString('en-IN', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      hour12: true, 
                      timeZone: 'Asia/Kolkata' 
                    })
                  : 'N/A'}
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
          <div key={person.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <span className="font-medium text-gray-800">{person.name}</span>
            <span className="text-sm text-gray-500 ml-2 break-words" title={person.email}>{person.email}</span>
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

  const formatTime = (date) => date 
    ? new Date(date).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true, 
        timeZone: 'Asia/Kolkata' 
      })
    : 'N/A';

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
          <div key={person.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
              <span className="font-medium text-gray-800 mb-1 sm:mb-0">{person.name}</span>
              <span className="text-sm text-yellow-700 font-semibold flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                Left at: {formatTime(person.leftAt)}
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-1 border-l-2 border-gray-300">
              <span className="font-medium">Reason:</span> {person.leaveReason || 'No reason provided.'}
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
  const [parseError, setParseError] = useState('');
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };
  
  const parseFile = (file) => {
    setIsLoading(true);
    setParseError('');
    
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
        setParseError(err.message || 'Failed to parse the file.');
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setParseError('Failed to read the file.');
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
        <div className="p-8 bg-indigo-600 text-white">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Workshop Check-In System
          </h1>
          <p className="text-center text-indigo-200 mt-2 text-sm">
            Created by Muneeb Basu
          </p>
        </div>
        
        <div 
          className="p-10"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Load Participant Data</h2>
          
          <label 
            htmlFor="file-upload" 
            className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
              <p className="mb-2 text-lg font-semibold text-gray-700">
                <span className="text-indigo-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">Please use the .CSV file</p>
            </div>
            <input id="file-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
          </label>
          
          {isLoading && (
            <p className="text-center text-lg font-medium text-indigo-600 mt-4 animate-pulse">
              Loading data...
            </p>
          )}
          
          {parseError && (
            <div className="flex items-center p-3 mt-4 bg-red-100 border-l-4 border-red-500 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="font-medium">{parseError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// DownloadReports Component
export const DownloadReports = ({ admitted, absentees, earlyLeavers, onDownloadAdmitted, onDownloadAbsentees, onDownloadEarlyLeavers }) => {
  return (
    <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Download Final Reports</h2>
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
