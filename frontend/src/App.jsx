import React, { useState, useMemo, useEffect } from 'react';
import { Search, UserPlus, LogOut, Sparkles, Award } from 'lucide-react';

// Import constants
import { WORKSHOP_CAPACITY } from './constants/constants';

// Import components
import { GeminiAnnouncementGenerator, GeminiWorkshopSummary } from './components/GeminiComponents';
import { 
  CertificateGenerator, 
  CertificateDesigner, 
  CertificateList 
} from './components/CertificateComponents';
import {
  GeneratedCard,
  SearchResults,
  EarlyLeaveSearchResults,
  StatusMessage,
  OnSpotRegistration,
  EarlyLeaveModal
} from './components/CheckinComponents';
import {
  WorkshopControl,
  ErrorMessage,
  AdmittedList,
  AbsentList,
  EarlyLeaveList,
  DataLoader,
  DownloadReports
} from './components/DashboardComponents';

// --- Main App Component ---
export default function App() {
  const [registrants, setRegistrants] = useState([]); // [MODIFIED] Start with empty data
  const [dataLoaded, setDataLoaded] = useState(false); // [NEW] State to control UI
  
  const [searchQuery, setSearchQuery] = useState('');
  const [earlyLeaveSearchQuery, setEarlyLeaveSearchQuery] = useState(''); // [NEW]
  const [currentCard, setCurrentCard] = useState(null);
  const [personToCertify, setPersonToCertify] = useState(null); // [NEW] For certificate modal
  const [personLeaving, setPersonLeaving] = useState(null); // [NEW] For early leave modal
  
  // --- Workshop State ---
  const [workshopState, setWorkshopState] = useState('idle'); // 'idle', 'active', 'finished'
  const [workshopEndTime, setWorkshopEndTime] = useState(null);
  
  const [durationHours, setDurationHours] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(30);
  
  const [timeLeft, setTimeLeft] = useState((durationHours * 3600) + (durationMinutes * 60)); 
  
  const [errorMessage, setErrorMessage] = useState('');
  
  const [currentView, setCurrentView] = useState('checkin'); // 'checkin', 'onspot', 'early_leave', 'ai', 'certificates'
  
  // --- [NEW] Certificate Design State ---
  const [certBody, setCertBody] = useState(`For successfully participating in the "Mini Workshop on Physics"
held on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`);
  const [nameFont, setNameFont] = useState('cursive'); // Participant Name font
  const [sigFont, setSigFont] = useState('cursive');   // Signature font
  const [certBg, setCertBg] = useState('White');     // Background color by name
  const [certBorder, setCertBorder] = useState('simple'); // [NEW] Border style
  const [certTitleFont, setCertTitleFont] = useState('elegant-serif'); // [NEW] Title font
  const [certificateThreshold, setCertificateThreshold] = useState(0); // In minutes

//load html-to-image script
useEffect(() => {
  const scriptId = 'html-to-image-script';
  if (document.getElementById(scriptId)) return;
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
  script.async = true;
  document.head.appendChild(script);
  return () => {
    const loadedScript = document.getElementById(scriptId);
    if (loadedScript) {
      document.head.removeChild(loadedScript);
    }
  };
}, []);

  // --- Workshop Timer Logic ---
  useEffect(() => {
    if (workshopState !== 'active' || !workshopEndTime) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const secondsRemaining = Math.round((workshopEndTime.getTime() - now.getTime()) / 1000);

      if (secondsRemaining <= 0) {
        clearInterval(interval);
        setWorkshopState('finished');
        setTimeLeft(0);
        // Mark all remaining 'pending' as 'absent'
        setRegistrants(prevRegistrants => 
          prevRegistrants.map(person => 
            person.status === 'pending' ? { ...person, status: 'absent' } : person
          )
        );
      } else {
        setTimeLeft(secondsRemaining);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [workshopState, workshopEndTime]);

  // --- Search & Filter Logic ---
  const searchLogic = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    if (!lowerCaseQuery) {
      return { status: 'idle', results: [] };
    }
    // Only search 'pending' participants
    const pendingRegistrants = registrants.filter(p => p.status === 'pending');
    const filteredResults = pendingRegistrants.filter(person =>
      person.name.toLowerCase().includes(lowerCaseQuery) ||
      person.email.toLowerCase().includes(lowerCaseQuery) ||
      person.phone.toLowerCase().includes(lowerCaseQuery)
    );
    return { 
      status: filteredResults.length > 0 ? 'found' : 'notFound', 
      results: filteredResults 
    };
  }, [searchQuery, registrants]);
  
  // --- [NEW] Early Leave Search Logic ---
  const earlyLeaveSearchLogic = useMemo(() => {
    const lowerCaseQuery = earlyLeaveSearchQuery.toLowerCase().trim();
    if (!lowerCaseQuery) {
      return { status: 'idle', results: [] };
    }
    // Only search 'admitted' participants
    const admittedRegistrants = registrants.filter(p => p.status === 'admitted');
    const filteredResults = admittedRegistrants.filter(person =>
      person.name.toLowerCase().includes(lowerCaseQuery) ||
      person.email.toLowerCase().includes(lowerCaseQuery) ||
      person.phone.toLowerCase().includes(lowerCaseQuery)
    );
    return { 
      status: filteredResults.length > 0 ? 'found' : 'notFound', 
      results: filteredResults 
    };
  }, [earlyLeaveSearchQuery, registrants]);


  // --- Memoized Participant Lists & Capacity ---
  const admittedPeople = useMemo(() => {
    return registrants
      .filter(p => p.status === 'admitted')
      .sort((a, b) => new Date(a.admittedAt) - new Date(b.admittedAt)); // Sort by admission time
  }, [registrants]);
  
  const absentPeople = useMemo(() => {
    return registrants.filter(p => p.status === 'absent');
  }, [registrants]);
  
  const earlyLeavers = useMemo(() => {
    return registrants
      .filter(p => p.status === 'left_early')
      .sort((a, b) => new Date(a.leftAt) - new Date(b.leftAt));
  }, [registrants]);
  
  const onSpotCount = useMemo(() => {
    // Count on-spot from both admitted and early-leavers
    return registrants.filter(p => (p.status === 'admitted' || p.status === 'left_early') && p.onSpot).length;
  }, [registrants]);
  
  // [MODIFIED] Capacity now checks admitted + left_early
  const totalOccupiedCount = useMemo(() => {
    return registrants.filter(p => p.status === 'admitted' || p.status === 'left_early').length;
  }, [registrants]);
  const capacityReached = useMemo(() => totalOccupiedCount >= WORKSHOP_CAPACITY, [totalOccupiedCount]);
  
  // [NEW] Workshop duration in seconds
  const workshopDurationInSeconds = useMemo(() => {
    const hours = parseInt(durationHours, 10) || 0;
    const minutes = parseInt(durationMinutes, 10) || 0;
    return (hours * 3600) + (minutes * 60);
  }, [durationHours, durationMinutes]);

  // [NEW] Certificate Eligibility Logic
  const eligibleForCertificate = useMemo(() => {
    const thresholdInSeconds = (parseInt(certificateThreshold, 10) || 0) * 60;
    const minimumStayDuration = workshopDurationInSeconds - thresholdInSeconds;
    
    // 1. All participants who stayed the whole time
    const fullTime = admittedPeople;
    
    // 2. Participants who left early but met the threshold
    const eligibleEarlyLeavers = earlyLeavers.filter(person => {
      if (!person.admittedAt || !person.leftAt) return false;
      const stayDuration = (new Date(person.leftAt).getTime() - new Date(person.admittedAt).getTime()) / 1000;
      return stayDuration >= minimumStayDuration;
    });
    
    return [...fullTime, ...eligibleEarlyLeavers];
  }, [admittedPeople, earlyLeavers, certificateThreshold, workshopDurationInSeconds]);


  // --- [MODIFIED] Handle Start Workshop ---
  const handleStartWorkshop = () => {
    if (workshopDurationInSeconds <= 0) {
      showErrorMessage("Duration must be greater than 0 minutes.");
      return;
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + workshopDurationInSeconds * 1000); 
    setWorkshopEndTime(endTime);
    setWorkshopState('active');
    setTimeLeft(workshopDurationInSeconds); 
  };
  
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000); // Clear error after 3s
  };

  // --- Handle Validation ---
  const handleValidate = (personId) => {
    if (workshopState !== 'active') {
      return showErrorMessage('Workshop is not active. Cannot admit participants.');
    }
    if (capacityReached) {
      return showErrorMessage('Workshop is at full capacity. Cannot admit.');
    }
    
    let validatedPerson = null;
    const admissionTime = new Date(); 

    const updatedRegistrants = registrants.map(person => {
      if (person.id === personId) {
        validatedPerson = { ...person, status: 'admitted', admittedAt: admissionTime }; 
        return validatedPerson;
      }
      return person;
    });

    setRegistrants(updatedRegistrants);
    setCurrentCard(validatedPerson); 
    setSearchQuery(''); 
  };
  
  // --- [NEW] Handle On-Spot Registration ---
  const handleOnSpotRegister = (personData) => {
    if (workshopState !== 'active') {
      return showErrorMessage('Workshop is not active. Cannot register participants.');
    }
    if (capacityReached) {
      return showErrorMessage('Workshop is at full capacity. Cannot register.');
    }
    
    const admissionTime = new Date();
    const newPerson = {
      ...personData,
      id: 1000 + registrants.length, // Simple unique ID
      status: 'admitted',
      admittedAt: admissionTime,
      leftAt: null,
      leaveReason: '',
      onSpot: true
    };
    
    setRegistrants(prev => [...prev, newPerson]);
    setCurrentCard(newPerson); // Show pass for new person
  };

  // --- [NEW] Handle Marking Early Leave ---
  const handleMarkLeaveEarly = (person) => {
    setPersonLeaving(person); // Open the modal
  };

  const handleSubmitLeaveEarly = (person, reason) => {
    const leaveTime = new Date();
    
    setRegistrants(prevRegistrants => 
      prevRegistrants.map(p => 
        p.id === person.id
          ? { ...p, status: 'left_early', leftAt: leaveTime, leaveReason: reason }
          : p
      )
    );
    
    setPersonLeaving(null); // Close modal
    setEarlyLeaveSearchQuery(''); // Clear search
    showErrorMessage(`${person.name} has been marked as left early.`);
  };
  
  
  // --- [NEW] CSV Download Logic ---
  const generateCSV = (data, headers, filename) => {
    if (data.length === 0) return;
    
    const escapeField = (field) => {
      const str = String(field || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
      
    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += row.map(escapeField).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const formatTimeForCSV = (date) => date 
    ? new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
    : 'N/A';
  
  const handleDownloadAdmitted = () => {
    const headers = ['Name', 'Email', 'Phone', 'Department', 'Year', 'AdmittedAt', 'OnSpot'];
    const data = admittedPeople.map(p => [
      p.name, p.email, p.phone, p.department, p.year,
      formatTimeForCSV(p.admittedAt),
      p.onSpot ? 'Yes' : 'No'
    ]);
    generateCSV(data, headers, 'admitted_participants.csv');
  };
  
  const handleDownloadAbsentees = () => {
    const headers = ['Name', 'Email', 'Phone', 'Department', 'Year'];
    const data = absentPeople.map(p => [
      p.name, p.email, p.phone, p.department, p.year
    ]);
    generateCSV(data, headers, 'absent_participants.csv');
  };

  // [NEW] Download Early Leavers
  const handleDownloadEarlyLeavers = () => {
    const headers = ['Name', 'Email', 'Phone', 'AdmittedAt', 'LeftAt', 'LeaveReason', 'OnSpot'];
    const data = earlyLeavers.map(p => [
      p.name, p.email, p.phone,
      formatTimeForCSV(p.admittedAt),
      formatTimeForCSV(p.leftAt),
      p.leaveReason,
      p.onSpot ? 'Yes' : 'No'
    ]);
    generateCSV(data, headers, 'early_leavers.csv');
  };
  
  
  // --- [NEW] Handler for when data is loaded ---
  const handleDataLoaded = (data) => {
    setRegistrants(data);
    setDataLoaded(true);
  };
  
  // --- [NEW] Handler for certificate modal ---
  const handleGenerateCertificate = (person) => {
    setPersonToCertify(person);
  };

  // --- [NEW] Render Data Loader if data isn't loaded ---
  if (!dataLoaded) {
    return <DataLoader onDataLoaded={handleDataLoaded} />;
  }

  // --- [MODIFIED] Main App Render (only happens *after* data is loaded) ---
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* --- Header Section --- */}
        <div className="p-8 bg-indigo-600 text-white">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Workshop Check-In System
          </h1>
          <p className="text-center text-indigo-200 mt-2 text-sm">
            Created by Muneeb Basu
          </p>
        </div>

        {/* --- Content Section --- */}
        <div className="p-6 md:p-10">
          
          <GeneratedCard 
            person={currentCard} 
            onClose={() => setCurrentCard(null)} 
          />
          
          {/* [NEW] Certificate Modal Render */}
          {personToCertify && (
            <CertificateGenerator 
              person={personToCertify}
              onClose={() => setPersonToCertify(null)}
              certBody={certBody}
              nameFont={nameFont}
              sigFont={sigFont}
              certBg={certBg}
              certBorder={certBorder}
              certTitleFont={certTitleFont}
            />
          )}

          {/* [NEW] Early Leave Modal Render */}
          {personLeaving && (
            <EarlyLeaveModal
              person={personLeaving}
              onClose={() => setPersonLeaving(null)}
              onSubmit={handleSubmitLeaveEarly}
            />
          )}
          
          <WorkshopControl 
            workshopState={workshopState}
            onStart={handleStartWorkshop}
            timeLeft={timeLeft}
            capacityReached={capacityReached}
            totalAdmitted={totalOccupiedCount} // [MODIFIED] Show total occupied
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
          />
          
          {/* --- [MODIFIED] Tabbed Interface (4 tabs now) --- */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <button
              onClick={() => setCurrentView('checkin')}
              className={`py-3 px-2 md:px-4 font-semibold rounded-lg flex items-center justify-center transition ${
                currentView === 'checkin' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Search className="h-5 w-5 mr-2" />
              Check-in
            </button>
            <button
              onClick={() => setCurrentView('onspot')}
              className={`py-3 px-2 md:px-4 font-semibold rounded-lg flex items-center justify-center transition ${
                currentView === 'onspot' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              On-Spot
            </button>
            {/* [NEW] Early Leave Tab */}
            <button
              onClick={() => setCurrentView('early_leave')}
              className={`py-3 px-2 md:px-4 font-semibold rounded-lg flex items-center justify-center transition ${
                currentView === 'early_leave' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Early Leave
            </button>
            <button
              onClick={() => setCurrentView('ai')}
              className={`py-3 px-2 md:px-4 font-semibold rounded-lg flex items-center justify-center transition ${
                currentView === 'ai' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              AI Tools
            </button>
          </div>
          
          {/* [NEW] Third row for Certificates tab, only shows when finished */}
          {workshopState === 'finished' && (
              <div className="mb-6">
                <button
                  onClick={() => setCurrentView('certificates')}
                  className={`w-full py-3 px-4 font-semibold rounded-lg flex items-center justify-center transition ${
                    currentView === 'certificates' 
                      ? 'bg-purple-700 text-white shadow' 
                      : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                >
                  <Award className="h-5 w-5 mr-2" />
                  Reports & Certificates
                </button>
              </div>
          )}
          
          {/* --- Error Message Display --- */}
          <ErrorMessage message={errorMessage} />
          
          {/* --- [MODIFIED] Conditional Content Area --- */}
          {currentView === 'checkin' && (
            <div id="checkin-panel">
              {/* --- Search Bar --- */}
              <div>
                <label htmlFor="search" className="block text-lg font-medium text-gray-800 mb-2">
                  Validate Entrant
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    disabled={workshopState !== 'active' || capacityReached}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* --- Results Section --- */}
              <div className="mt-6">
                {searchLogic.status === 'found' ? (
                  <SearchResults 
                    results={searchLogic.results} 
                    onValidate={handleValidate}
                    workshopActive={workshopState === 'active'}
                    capacityReached={capacityReached}
                  />
                ) : (
                  <StatusMessage 
                    status={searchLogic.status} 
                    query={searchQuery.trim()} 
                    type="checkin"
                  />
                )}
              </div>
              
              {/* --- [MODIFIED] Show Admitted List on Check-in Tab --- */}
              <AdmittedList 
                admittedPeople={admittedPeople} 
                totalCapacity={WORKSHOP_CAPACITY} 
              />
            </div>
          )}
          
          {currentView === 'onspot' && (
            <OnSpotRegistration 
              onRegister={handleOnSpotRegister}
              workshopActive={workshopState === 'active'}
              capacityReached={capacityReached}
            />
          )}

          {/* [NEW] Early Leave Panel */}
          {currentView === 'early_leave' && (
             <div id="early-leave-panel">
              {/* --- Search Bar --- */}
              <div>
                <label htmlFor="early-search" className="block text-lg font-medium text-gray-800 mb-2">
                  Find Admitted Participant
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="early-search"
                    value={earlyLeaveSearchQuery}
                    onChange={(e) => setEarlyLeaveSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    disabled={workshopState !== 'active'}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* --- Results Section --- */}
              <div className="mt-6">
                {earlyLeaveSearchLogic.status === 'found' ? (
                  <EarlyLeaveSearchResults 
                    results={earlyLeaveSearchLogic.results} 
                    onMarkLeave={handleMarkLeaveEarly}
                    workshopActive={workshopState === 'active'}
                  />
                ) : (
                  <StatusMessage 
                    status={earlyLeaveSearchLogic.status} 
                    query={earlyLeaveSearchQuery.trim()} 
                    type="early_leave"
                  />
                )}
              </div>

              <EarlyLeaveList earlyLeavers={earlyLeavers} />
            </div>
          )}

          {/* --- [NEW] AI Tools Tab Content --- */}
          {currentView === 'ai' && (
            <div id="ai-tools-panel">
              {workshopState !== 'finished' ? (
                <GeminiAnnouncementGenerator />
              ) : (
                <GeminiWorkshopSummary
                  admitted={admittedPeople}
                  absentees={absentPeople}
                  onSpotCount={onSpotCount}
                  earlyLeavers={earlyLeavers} // [NEW] Pass early leavers
                />
              )}
            </div>
          )}
          
          {/* --- [NEW] Certificates Tab Content --- */}
          {currentView === 'certificates' && workshopState === 'finished' && (
            <div id="certificates-panel">
              
              {/* [MODIFIED] Certificate Designer with threshold */}
              <CertificateDesigner 
                certBody={certBody}
                setCertBody={setCertBody}
                nameFont={nameFont}
                setNameFont={setNameFont}
                sigFont={sigFont}
                setSigFont={setSigFont}
                certBg={certBg}
                setCertBg={setCertBg}
                certBorder={certBorder}
                setCertBorder={setCertBorder}
                certTitleFont={certTitleFont}
                setCertTitleFont={setCertTitleFont}
                threshold={certificateThreshold}
                setThreshold={setCertificateThreshold}
                eligibleCount={eligibleForCertificate.length}
              />

              {/* [MODIFIED] Reports moved here, added early leavers */}
              <DownloadReports 
                admitted={admittedPeople}
                absentees={absentPeople}
                earlyLeavers={earlyLeavers}
                onDownloadAdmitted={handleDownloadAdmitted}
                onDownloadAbsentees={handleDownloadAbsentees}
                onDownloadEarlyLeavers={handleDownloadEarlyLeavers}
              />
              
              {/* [MODIFIED] List now uses eligible people */}
              <CertificateList
                eligiblePeople={eligibleForCertificate}
                onGenerateCertificate={handleGenerateCertificate}
              />
              
              {/* [NEW] Absentee list moved here */}
              <AbsentList absentPeople={absentPeople} />

              {/* [NEW] Early Leavers list also shown here for review */}
              <EarlyLeaveList earlyLeavers={earlyLeavers} />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}