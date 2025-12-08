import React, { useState, useMemo, useEffect } from "react";
import { Search, UserPlus, LogOut, Sparkles, Award } from "lucide-react";
import { generateAndSendPass } from './utils/passGenerator';
import { generateAndSendCertificate } from './utils/certificateGenerator';

// Import constants
import { WORKSHOP_CAPACITY } from "./constants/constants";

// Import components
import {
  GeminiAnnouncementGenerator,
  GeminiWorkshopSummary,
} from "./components/GeminiComponents";
import {
  CertificateGenerator,
  CertificateDesigner,
  CertificateList,
} from "./components/CertificateComponents";
import {
  GeneratedCard,
  EarlyLeaveModal,
} from "./components/CheckinComponents";
import { UnifiedCheckinView } from "./components/UnifiedCheckinView";
import {
  WorkshopControl,
  ErrorMessage,
  AdmittedList,
  AbsentList,
  EarlyLeaveList,
  DataLoader,
  DownloadReports,
  Dashboard,
} from "./components/DashboardComponents";
import { Sidebar } from "./components/Sidebar";

// --- Main App Component ---
export default function App() {
  const [registrants, setRegistrants] = useState([]); // [MODIFIED] Start with empty data
  const [dataLoaded, setDataLoaded] = useState(false); // [NEW] State to control UI

  const [searchQuery, setSearchQuery] = useState("");
  const [earlyLeaveSearchQuery, setEarlyLeaveSearchQuery] = useState(""); // [NEW]
  const [currentCard, setCurrentCard] = useState(null);
  const [personToCertify, setPersonToCertify] = useState(null); // [NEW] For certificate modal
  const [personLeaving, setPersonLeaving] = useState(null); // [NEW] For early leave modal

  // --- Workshop State ---
  const [workshopState, setWorkshopState] = useState("idle"); // 'idle', 'active', 'finished'
  const [workshopEndTime, setWorkshopEndTime] = useState(null);

  const [durationHours, setDurationHours] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [timeLeft, setTimeLeft] = useState(
    durationHours * 3600 + durationMinutes * 60
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [currentView, setCurrentView] = useState("checkin"); // 'checkin', 'ai', 'certificates'
  const [activeSubView, setActiveSubView] = useState("checkin");

  // --- [NEW] Certificate Design State ---
  const [certBody, setCertBody] =
    useState(`For successfully participating in the "Mini Workshop on Physics"
held on ${new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}.`);
  const [nameFont, setNameFont] = useState("cursive"); // Participant Name font
  const [sigFont, setSigFont] = useState("cursive"); // Signature font
  const [certBg, setCertBg] = useState("White"); // Background color by name
  const [certBorder, setCertBorder] = useState("simple"); // [NEW] Border style
  const [certTitleFont, setCertTitleFont] = useState("elegant-serif"); // [NEW] Title font
  const [certificateThreshold, setCertificateThreshold] = useState(0); // In minutes

  // --- Certificate Sending Status ---
  const [certificatesSending, setCertificatesSending] = useState(false);
  const [certificatesSent, setCertificatesSent] = useState(0);
  const [certificatesFailed, setCertificatesFailed] = useState(0);

  // --- Pass Sending Status ---
  const [passesSending, setPassesSending] = useState(false);
  const [passesSent, setPassesSent] = useState(0);
  const [passesFailed, setPassesFailed] = useState(0);

  //load html-to-image script
  useEffect(() => {
    const scriptId = "html-to-image-script";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js";
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
    if (workshopState !== "active" || !workshopEndTime) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const secondsRemaining = Math.round(
        (workshopEndTime.getTime() - now.getTime()) / 1000
      );

      if (secondsRemaining <= 0) {
        clearInterval(interval);
        setWorkshopState("finished");
        setTimeLeft(0);
        // Mark all remaining 'pending' as 'absent'
        setRegistrants((prevRegistrants) =>
          prevRegistrants.map((person) =>
            person.status === "pending"
              ? { ...person, status: "absent" }
              : person
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
      return { status: "idle", results: [] };
    }
    // Only search 'pending' participants
    const pendingRegistrants = registrants.filter(
      (p) => p.status === "pending"
    );
    const filteredResults = pendingRegistrants.filter(
      (person) =>
        person.name.toLowerCase().includes(lowerCaseQuery) ||
        person.email.toLowerCase().includes(lowerCaseQuery) ||
        person.phone.toLowerCase().includes(lowerCaseQuery)
    );
    return {
      status: filteredResults.length > 0 ? "found" : "notFound",
      results: filteredResults,
    };
  }, [searchQuery, registrants]);

  // --- [NEW] Early Leave Search Logic ---
  const earlyLeaveSearchLogic = useMemo(() => {
    const lowerCaseQuery = earlyLeaveSearchQuery.toLowerCase().trim();
    if (!lowerCaseQuery) {
      return { status: "idle", results: [] };
    }
    // Only search 'admitted' participants
    const admittedRegistrants = registrants.filter(
      (p) => p.status === "admitted"
    );
    const filteredResults = admittedRegistrants.filter(
      (person) =>
        person.name.toLowerCase().includes(lowerCaseQuery) ||
        person.email.toLowerCase().includes(lowerCaseQuery) ||
        person.phone.toLowerCase().includes(lowerCaseQuery)
    );
    return {
      status: filteredResults.length > 0 ? "found" : "notFound",
      results: filteredResults,
    };
  }, [earlyLeaveSearchQuery, registrants]);

  // --- Memoized Participant Lists & Capacity ---
  const admittedPeople = useMemo(() => {
    return registrants
      .filter((p) => p.status === "admitted")
      .sort((a, b) => new Date(a.admittedAt) - new Date(b.admittedAt)); // Sort by admission time
  }, [registrants]);

  const absentPeople = useMemo(() => {
    return registrants.filter((p) => p.status === "absent");
  }, [registrants]);

  const earlyLeavers = useMemo(() => {
    return registrants
      .filter((p) => p.status === "left_early")
      .sort((a, b) => new Date(a.leftAt) - new Date(b.leftAt));
  }, [registrants]);

  const onSpotCount = useMemo(() => {
    // Count on-spot from both admitted and early-leavers
    return registrants.filter(
      (p) => (p.status === "admitted" || p.status === "left_early") && p.onSpot
    ).length;
  }, [registrants]);

  // [MODIFIED] Capacity now checks admitted + left_early
  const totalOccupiedCount = useMemo(() => {
    return registrants.filter(
      (p) => p.status === "admitted" || p.status === "left_early"
    ).length;
  }, [registrants]);
  const capacityReached = useMemo(
    () => totalOccupiedCount >= WORKSHOP_CAPACITY,
    [totalOccupiedCount]
  );

  // [NEW] Workshop duration in seconds
  const workshopDurationInSeconds = useMemo(() => {
    const hours = parseInt(durationHours, 10) || 0;
    const minutes = parseInt(durationMinutes, 10) || 0;
    return hours * 3600 + minutes * 60;
  }, [durationHours, durationMinutes]);

  // [NEW] Certificate Eligibility Logic
  const eligibleForCertificate = useMemo(() => {
    const thresholdInSeconds = (parseInt(certificateThreshold, 10) || 0) * 60;
    const minimumStayDuration = workshopDurationInSeconds - thresholdInSeconds;

    // 1. All participants who stayed the whole time
    const fullTime = admittedPeople;

    // 2. Participants who left early but met the threshold
    const eligibleEarlyLeavers = earlyLeavers.filter((person) => {
      if (!person.admittedAt || !person.leftAt) return false;
      const stayDuration =
        (new Date(person.leftAt).getTime() -
          new Date(person.admittedAt).getTime()) /
        1000;
      return stayDuration >= minimumStayDuration;
    });

    return [...fullTime, ...eligibleEarlyLeavers];
  }, [
    admittedPeople,
    earlyLeavers,
    certificateThreshold,
    workshopDurationInSeconds,
  ]);

  // --- Auto-send Certificates When Workshop Finishes ---
  useEffect(() => {
    const sendCertificatesToEligible = async () => {
      if (workshopState !== "finished" || eligibleForCertificate.length === 0) {
        return;
      }

      // Check if we've already started sending (prevent duplicate sends)
      if (certificatesSending) {
        return;
      }

      setCertificatesSending(true);
      setCertificatesSent(0);
      setCertificatesFailed(0);

      console.log(`Starting to send certificates to ${eligibleForCertificate.length} eligible participants...`);

      const certificateConfig = {
        certBody,
        nameFont,
        sigFont,
        certBg,
        certBorder,
        certTitleFont
      };

      let sent = 0;
      let failed = 0;

      for (const participant of eligibleForCertificate) {
        try {
          const success = await generateAndSendCertificate(participant, certificateConfig);
          if (success) {
            sent++;
            setCertificatesSent(sent);
          } else {
            failed++;
            setCertificatesFailed(failed);
          }
          // Small delay between sends to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error sending certificate to ${participant.name}:`, error);
          failed++;
          setCertificatesFailed(failed);
        }
      }

      setCertificatesSending(false);
      console.log(`Certificate sending complete: ${sent} sent, ${failed} failed`);
    };

    sendCertificatesToEligible();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopState, eligibleForCertificate]);

  // --- [MODIFIED] Handle Start Workshop ---
  const handleStartWorkshop = () => {
    if (workshopDurationInSeconds <= 0) {
      showErrorMessage("Duration must be greater than 0 minutes.");
      return;
    }

    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + workshopDurationInSeconds * 1000
    );
    setWorkshopEndTime(endTime);
    setWorkshopState("active");
    setTimeLeft(workshopDurationInSeconds);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000); // Clear error after 3s
  };

  // --- Handle Validation ---
  const handleValidate = async (personId) => {
    if (workshopState !== "active") {
      return showErrorMessage("Workshop is not active.");
    }
    if (capacityReached) {
      return showErrorMessage("Workshop is at full capacity.");
    }

    const admissionTime = new Date();
    let validatedPerson = null;

    const updatedRegistrants = registrants.map((person) => {
      if (person.id === personId) {
        validatedPerson = {
          ...person,
          status: "admitted",
          admittedAt: admissionTime,
        };
        return validatedPerson;
      }
      return person;
    });

    setRegistrants(updatedRegistrants);
    setCurrentCard(validatedPerson);
    setSearchQuery("");

    // ✅ NEW: Auto-send pass via email
    setTimeout(async () => {
      setPassesSending(true);
      const success = await generateAndSendPass(validatedPerson);
      if (success) {
        setPassesSent(prev => prev + 1);
      } else {
        setPassesFailed(prev => prev + 1);
      }
      setPassesSending(false);
    }, 500); // Small delay for render
  };

  // --- [NEW] Handle On-Spot Registration ---
  const handleOnSpotRegister = async (personData) => {
    if (workshopState !== "active") {
      return showErrorMessage("Workshop is not active.");
    }
    if (capacityReached) {
      return showErrorMessage("Workshop is at full capacity.");
    }

    const admissionTime = new Date();
    const newPerson = {
      ...personData,
      id: 1000 + registrants.length,
      status: "admitted",
      admittedAt: admissionTime,
      leftAt: null,
      leaveReason: "",
      onSpot: true,
    };

    setRegistrants((prev) => [...prev, newPerson]);
    setCurrentCard(newPerson);

    // ✅ NEW: Auto-send pass via email
    setTimeout(async () => {
      setPassesSending(true);
      const success = await generateAndSendPass(newPerson);
      if (success) {
        setPassesSent(prev => prev + 1);
      } else {
        setPassesFailed(prev => prev + 1);
      }
      setPassesSending(false);
    }, 500);
  };

  // --- [NEW] Handle Marking Early Leave ---
  const handleMarkLeaveEarly = (person) => {
    setPersonLeaving(person); // Open the modal
  };

  const handleSubmitLeaveEarly = (person, reason) => {
    const leaveTime = new Date();

    setRegistrants((prevRegistrants) =>
      prevRegistrants.map((p) =>
        p.id === person.id
          ? {
              ...p,
              status: "left_early",
              leftAt: leaveTime,
              leaveReason: reason,
            }
          : p
      )
    );

    setPersonLeaving(null); // Close modal
    setEarlyLeaveSearchQuery(""); // Clear search
    showErrorMessage(`${person.name} has been marked as left early.`);
  };

  // --- [NEW] CSV Download Logic ---
  const generateCSV = (data, headers, filename) => {
    if (data.length === 0) return;

    const escapeField = (field) => {
      const str = String(field || "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csvContent = headers.join(",") + "\n";
    data.forEach((row) => {
      csvContent += row.map(escapeField).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatTimeForCSV = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : "N/A";

  const handleDownloadAdmitted = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Department",
      "Year",
      "AdmittedAt",
      "OnSpot",
    ];
    const data = admittedPeople.map((p) => [
      p.name,
      p.email,
      p.phone,
      p.department,
      p.year,
      formatTimeForCSV(p.admittedAt),
      p.onSpot ? "Yes" : "No",
    ]);
    generateCSV(data, headers, "admitted_participants.csv");
  };

  const handleDownloadAbsentees = () => {
    const headers = ["Name", "Email", "Phone", "Department", "Year"];
    const data = absentPeople.map((p) => [
      p.name,
      p.email,
      p.phone,
      p.department,
      p.year,
    ]);
    generateCSV(data, headers, "absent_participants.csv");
  };

  // [NEW] Download Early Leavers
  const handleDownloadEarlyLeavers = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "AdmittedAt",
      "LeftAt",
      "LeaveReason",
      "OnSpot",
    ];
    const data = earlyLeavers.map((p) => [
      p.name,
      p.email,
      p.phone,
      formatTimeForCSV(p.admittedAt),
      formatTimeForCSV(p.leftAt),
      p.leaveReason,
      p.onSpot ? "Yes" : "No",
    ]);
    generateCSV(data, headers, "early_leavers.csv");
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
    <div className="min-h-screen bg-white flex font-sans gap-2 pl-0 pr-2 py-0">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        workshopState={workshopState}
        activeSubView={activeSubView}
        setActiveSubView={setActiveSubView}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header section moved - will be redesigned in step 3 */}
        
        {/* Content wrapper */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
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

          {/* --- Error Message Display --- */}
          <ErrorMessage message={errorMessage} />

          {/* Dashboard View */}
          {currentView === "dashboard" && (
            <Dashboard
              workshopState={workshopState}
              timeLeft={timeLeft}
              workshopEndTime={workshopEndTime}
              registrants={registrants}
              admittedPeople={admittedPeople}
              absentPeople={absentPeople}
              earlyLeavers={earlyLeavers}
              onSpotCount={onSpotCount}
              totalCapacity={WORKSHOP_CAPACITY}
              capacityReached={capacityReached}
              onDownloadAdmitted={handleDownloadAdmitted}
              onDownloadAbsentees={handleDownloadAbsentees}
              onDownloadEarlyLeavers={handleDownloadEarlyLeavers}
              onImportCSV={() => {
                setDataLoaded(false);
                setRegistrants([]);
              }}
              passesSent={passesSent}
              passesFailed={passesFailed}
              passesSending={passesSending}
              certificatesSent={certificatesSent}
              certificatesFailed={certificatesFailed}
              certificatesSending={certificatesSending}
              eligibleForCertificate={eligibleForCertificate.length}
            />
          )}

          {/* Unified Check-in View */}
          {currentView === "checkin" && (
            <>
              <UnifiedCheckinView
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                earlyLeaveSearchQuery={earlyLeaveSearchQuery}
                setEarlyLeaveSearchQuery={setEarlyLeaveSearchQuery}
                searchLogic={searchLogic}
                earlyLeaveSearchLogic={earlyLeaveSearchLogic}
                onValidate={handleValidate}
                onOnSpotRegister={handleOnSpotRegister}
                onMarkLeaveEarly={handleMarkLeaveEarly}
                workshopState={workshopState}
                workshopEndTime={workshopEndTime}
                timeLeft={timeLeft}
                durationHours={durationHours}
                durationMinutes={durationMinutes}
                setDurationHours={setDurationHours}
                setDurationMinutes={setDurationMinutes}
                onStartWorkshop={handleStartWorkshop}
                totalOccupiedCount={totalOccupiedCount}
                capacityReached={capacityReached}
                activeSubView={activeSubView}
                setActiveSubView={setActiveSubView}
              />

              {/* Show Admitted List Below */}
              <div className="mt-6">
                <AdmittedList
                  admittedPeople={admittedPeople}
                  totalCapacity={WORKSHOP_CAPACITY}
                />
              </div>
            </>
          )}

          {/* --- [NEW] AI Tools Tab Content --- */}
          {currentView === "ai" && (
            <div id="ai-tools-panel">
              {workshopState !== "finished" ? (
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
          {currentView === "certificates" && workshopState === "finished" && (
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
    </div>
  );
}
