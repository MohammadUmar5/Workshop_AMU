import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, UserPlus, LogOut, Sparkles, Award, Settings } from "lucide-react";
import { generateAndSendPass } from './utils/passGenerator';
import { generateAndSendCertificate } from './utils/certificateGenerator';
import { parseCSV } from './utils/csvParser';
import * as workshopDB from './hooks/useWorkshopDB';


// Import constants
import { WORKSHOP_CAPACITY } from "./constants/constants";
import { colors } from "./theme/colors";

// Import components
import {
  GeminiAnnouncementGenerator,
  GeminiWorkshopSummary,
} from "./components/GeminiComponents";
import {
  CertificateGenerator,
} from "./components/CertificateComponents";
import {
  GeneratedCard,
  EarlyLeaveModal,
} from "./components/CheckinComponents";
import { SettingsModal } from "./components/SettingsModal";
import { UnifiedCheckinView } from "./components/UnifiedCheckinView";
import {
  WorkshopControl,
  ErrorMessage,
  AdmittedList,
  AbsentList,
  EarlyLeaveList,
  DownloadReports,
  Dashboard,
} from "./components/DashboardComponents";
import { Sidebar } from "./components/Sidebar";
import MiddlePanel from "./components/MiddlePanel";
import PassCustomizationPanel from "./components/PassCustomizationPanel";

// --- Main App Component ---
export default function App() {
  const [registrants, setRegistrants] = useState([]); // Start with empty data

  const [searchQuery, setSearchQuery] = useState("");
  const [earlyLeaveSearchQuery, setEarlyLeaveSearchQuery] = useState(""); // [NEW]
  const [currentCard, setCurrentCard] = useState(null);
  const [personToCertify, setPersonToCertify] = useState(null); // [NEW] For certificate modal
  const [personLeaving, setPersonLeaving] = useState(null); // [NEW] For early leave modal
  const [showSettingsModal, setShowSettingsModal] = useState(false); // [NEW] For settings modal

  // --- Pass Customization State (certificates use fixed template) ---
  const [selectedCertAction, setSelectedCertAction] = useState(null); // 'pass' | null
  const [passTemplateConfig, setPassTemplateConfig] = useState(null);

  // --- Workshop State ---
  const [workshopState, setWorkshopState] = useState("idle"); // 'idle', 'active', 'finished'
  const [workshopEndTime, setWorkshopEndTime] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const [durationHours, setDurationHours] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [timeLeft, setTimeLeft] = useState(
    durationHours * 3600 + durationMinutes * 60
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [currentView, setCurrentView] = useState("dashboard"); // Start from dashboard
  const [activeSubView, setActiveSubView] = useState("checkin");

  // --- Certificate Configuration (fixed template) ---
  const [certificateThreshold, setCertificateThreshold] = useState(0); // In minutes

  // --- Certificate Sending Status ---
  const [certificatesSending, setCertificatesSending] = useState(false);
  const [certificatesSent, setCertificatesSent] = useState(0);
  const [certificatesFailed, setCertificatesFailed] = useState(0);

  // --- Pass Sending Status ---
  const [passesSending, setPassesSending] = useState(false);
  const [passesSent, setPassesSent] = useState(0);
  const [passesFailed, setPassesFailed] = useState(0);

  // --- Calculate progress from persistent data (survives refresh) ---
  const passesSentCount = useMemo(() => {
    return registrants.filter(p => p.passSent).length;
  }, [registrants]);

  const certificatesSentCount = useMemo(() => {
    return registrants.filter(p => p.certificateSent).length;
  }, [registrants]);

  // --- Permission States for Manual Trigger ---
  const [sendCertificatesPermission, setSendCertificatesPermission] = useState(false);
  const sendingInProgressRef = useRef(false);

  // --- Database State ---
  const [currentWorkshopId, setCurrentWorkshopId] = useState(null);
  const [dbInitialized, setDbInitialized] = useState(false);

  // --- Resume active workshop on mount ---
  useEffect(() => {
    const resumeWorkshop = async () => {
      const result = await workshopDB.getActiveWorkshop();
      if (result.success && result.data) {
        const workshop = result.data;
        
        // Calculate time left - use paused_time_left if paused, otherwise calculate from end_time
        const now = new Date();
        const endTime = new Date(workshop.end_time);
        let secondsLeft;
        
        if (workshop.is_paused && workshop.paused_time_left !== null) {
          // Use stored paused time to prevent time leakage
          secondsLeft = workshop.paused_time_left;
        } else {
          // Calculate from end_time for running timers
          secondsLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        }
        
        // Only resume as active if time hasn't expired and state is active
        // If time has expired or state is finished, set to finished/idle
        let finalState = workshop.state;
        if (workshop.state === 'active' && secondsLeft <= 0) {
          // Workshop time has expired, mark as finished
          finalState = 'finished';
          if (workshop.id) {
            await workshopDB.updateWorkshopState(workshop.id, 'finished', false);
          }
        } else if (workshop.state === 'active' && secondsLeft > 0) {
          // Only resume as active if there's time remaining
          finalState = 'active';
        } else if (workshop.state === 'finished') {
          finalState = 'finished';
        } else {
          // For any other state or if time expired, set to idle
          finalState = 'idle';
        }
        
        setCurrentWorkshopId(workshop.id);
        setWorkshopState(finalState);
        setWorkshopEndTime(finalState === 'active' ? new Date(workshop.end_time) : null);
        setIsPaused(workshop.is_paused && finalState === 'active');
        setCertificateThreshold(workshop.certificate_threshold);
        setTimeLeft(secondsLeft);
        
        // Load participants
        const participantsResult = await workshopDB.getWorkshopParticipants(workshop.id);
        if (participantsResult.success) {
          // Convert database format to app format
          const convertedParticipants = participantsResult.data.map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            department: p.department,
            year: p.year,
            diet: p.diet,
            status: p.status,
            admittedAt: p.admitted_at ? new Date(p.admitted_at) : null,
            leftAt: p.left_at ? new Date(p.left_at) : null,
            leaveReason: p.leave_reason,
            onSpot: p.on_spot,
            certificateSent: p.certificate_sent,
            passSent: p.pass_sent
          }));
          setRegistrants(convertedParticipants);
          
          // Check for recently admitted participants who haven't received passes
          const now = new Date();
          const recentlyAdmitted = convertedParticipants.filter(p => {
            if (p.status === 'admitted' && !p.passSent && p.admittedAt) {
              const admitTime = new Date(p.admittedAt);
              const minutesAgo = (now - admitTime) / 1000 / 60;
              return minutesAgo < 10; // Admitted within last 10 minutes
            }
            return false;
          });
          
          // Send passes to recently admitted participants
          if (recentlyAdmitted.length > 0) {
            console.log(`📧 Found ${recentlyAdmitted.length} recently admitted participant(s) without passes. Sending...`);
            recentlyAdmitted.forEach((participant, index) => {
              setTimeout(async () => {
                setPassesSending(true);
                const success = await generateAndSendPass(participant, workshop.id);
                if (success) {
                  setPassesSent(prev => prev + 1);
                  setRegistrants(prev => prev.map(p => 
                    p.id === participant.id ? { ...p, passSent: true } : p
                  ));
                  if (participant.id) {
                    await workshopDB.updateParticipantDeliveryStatus(participant.id, 'pass', true);
                  }
                } else {
                  setPassesFailed(prev => prev + 1);
                }
                setPassesSending(false);
              }, 1000 + (index * 1000)); // Stagger sends by 1 second each
            });
          }
        }
        
        // Certificate templates are now fixed - no need to load from DB
      }
      setDbInitialized(true);
    };

    resumeWorkshop();
  }, []);

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
    if (workshopState !== "active" || !workshopEndTime || isPaused || !currentWorkshopId) {
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
        
        // Mark workshop as finished in database
        if (currentWorkshopId) {
          workshopDB.updateWorkshopState(currentWorkshopId, "finished", false);
          workshopDB.markPendingAsAbsent(currentWorkshopId);
        }
        
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
  }, [workshopState, workshopEndTime, isPaused]);

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

  // --- Auto-send Certificates When Workshop Finishes (with Permission) ---
  useEffect(() => {
    const sendCertificatesToEligible = async () => {
      // Check all conditions before proceeding
      if (workshopState !== "finished" || eligibleForCertificate.length === 0) {
        return;
      }

      // Must have explicit permission to send
      if (!sendCertificatesPermission) {
        return;
      }

      // Prevent concurrent executions using ref
      if (sendingInProgressRef.current) {
        return;
      }

      // Filter out participants who already received certificates
      const pendingParticipants = eligibleForCertificate.filter(p => !p.certificateSent);
      
      if (pendingParticipants.length === 0) {
        console.log('All eligible participants already received certificates');
        setSendCertificatesPermission(false);
        return;
      }

      // Set locks
      sendingInProgressRef.current = true;
      setCertificatesSending(true);
      setCertificatesSent(0);
      setCertificatesFailed(0);

      console.log(`Starting to send certificates to ${pendingParticipants.length} pending participants...`);
      console.log('   → Using fixed certificate template');

      let sent = 0;
      let failed = 0;

      for (const participant of pendingParticipants) {
        try {
          const success = await generateAndSendCertificate(participant, currentWorkshopId);
          if (success) {
            sent++;
            setCertificatesSent(sent);
            
            // Mark participant as having received certificate
            setRegistrants(prev => prev.map(p => 
              p.id === participant.id ? { ...p, certificateSent: true } : p
            ));
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

      // Release locks and reset permission
      setCertificatesSending(false);
      sendingInProgressRef.current = false;
      setSendCertificatesPermission(false);
      console.log(`Certificate sending complete: ${sent} sent, ${failed} failed`);
    };

    sendCertificatesToEligible();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopState, eligibleForCertificate, sendCertificatesPermission]);

  // --- [MODIFIED] Handle Start Workshop ---
  const handleStartWorkshop = async () => {
    console.log('\n🚀 [WORKFLOW] Step 2: Starting workshop...');
    console.log('   → Duration:', durationHours, 'hours', durationMinutes, 'minutes');
    console.log('   → Certificate threshold:', certificateThreshold, 'minutes');
    
    if (workshopDurationInSeconds <= 0) {
      showErrorMessage("Duration must be greater than 0 minutes.");
      return;
    }

    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + workshopDurationInSeconds * 1000
    );
    
    console.log('   → Workshop will end at:', endTime.toLocaleString());
    
    // Create workshop in database
    const result = await workshopDB.createWorkshop(
      durationHours,
      durationMinutes,
      certificateThreshold
    );
    
    if (result.success) {
      console.log('✅ [WORKFLOW] Workshop started successfully!');
      console.log('   → Workshop ID:', result.data.id);
      
      setCurrentWorkshopId(result.data.id);
      setWorkshopEndTime(endTime);
      setWorkshopState("active");
      setTimeLeft(workshopDurationInSeconds);
      setIsPaused(false);
    } else {
      console.error('❌ [WORKFLOW] Failed to start workshop:', result.error);
      showErrorMessage("Failed to start workshop in database");
    }
  };

  // --- Handle Pause/Resume Workshop ---
  const handlePauseWorkshop = async () => {
    if (workshopState === "active" && currentWorkshopId) {
      const newPausedState = !isPaused;
      setIsPaused(newPausedState);
      
      if (newPausedState) {
        // Pausing - store remaining time and update database
        await workshopDB.updateWorkshopState(currentWorkshopId, "active", true);
        await workshopDB.updatePausedTimeLeft(currentWorkshopId, timeLeft);
      } else {
        // Resuming - recalculate end time based on timeLeft
        const now = new Date();
        const newEndTime = new Date(now.getTime() + timeLeft * 1000);
        setWorkshopEndTime(newEndTime);
        
        // Update database and clear paused time
        await workshopDB.updateWorkshopState(currentWorkshopId, "active", false);
        await workshopDB.updateWorkshopEndTime(currentWorkshopId, newEndTime);
        await workshopDB.updatePausedTimeLeft(currentWorkshopId, null);
      }
    }
  };

  // --- Handle Reset Workshop ---
  const handleResetWorkshop = async () => {
    if (currentWorkshopId) {
      // Mark workshop as finished in database
      await workshopDB.updateWorkshopState(currentWorkshopId, "idle", false);
    }
    
    setWorkshopState("idle");
    setWorkshopEndTime(null);
    setIsPaused(false);
    setTimeLeft(durationHours * 3600 + durationMinutes * 60);
    setCurrentWorkshopId(null);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000); // Clear error after 3s
  };

  // --- Handle Validation ---
  const handleValidate = async (personId) => {
    console.log('\n👤 [WORKFLOW] Step 3a: Check-in participant...');
    console.log('   → Participant ID:', personId);
    
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
    
    // Persist admission to database
    if (currentWorkshopId && validatedPerson.id) {
      workshopDB.updateParticipantStatus(validatedPerson.id, "admitted", {
        admitted_at: admissionTime.toISOString()
      });
    }

    // ✅ Auto-send pass via email (only if not already sent)
    if (!validatedPerson.passSent) {
      setTimeout(async () => {
        setPassesSending(true);
        const success = await generateAndSendPass(validatedPerson, currentWorkshopId);
        if (success) {
          setPassesSent(prev => prev + 1);
          // Mark as sent only after successful send
          setRegistrants(prev => prev.map(p => 
            p.id === personId ? { ...p, passSent: true } : p
          ));
          if (validatedPerson.id) {
            await workshopDB.updateParticipantDeliveryStatus(validatedPerson.id, 'pass', true);
          }
        } else {
          setPassesFailed(prev => prev + 1);
        }
        setPassesSending(false);
      }, 500); // Small delay for render
    }
  };

  // --- [NEW] Handle On-Spot Registration ---
  const handleOnSpotRegister = async (personData) => {
    console.log('\n👤 [WORKFLOW] Step 3b: On-spot registration...');
    console.log('   → Name:', personData.name);
    console.log('   → Email:', personData.email);
    
    if (workshopState !== "active") {
      return showErrorMessage("Workshop is not active.");
    }
    if (capacityReached) {
      return showErrorMessage("Workshop is at full capacity.");
    }

    // Check for duplicate by email
    const existingByEmail = registrants.find(
      p => p.email.toLowerCase() === personData.email.toLowerCase()
    );
    if (existingByEmail) {
      if (existingByEmail.status === "admitted") {
        return showErrorMessage("This participant is already admitted.");
      }
      if (existingByEmail.status === "left_early") {
        return showErrorMessage("This participant has already left early.");
      }
    }

    // Check for duplicate by phone
    const existingByPhone = registrants.find(
      p => p.phone === personData.phone
    );
    if (existingByPhone && existingByPhone.status !== "pending") {
      if (existingByPhone.status === "admitted") {
        return showErrorMessage("A participant with this phone number is already admitted.");
      }
      if (existingByPhone.status === "left_early") {
        return showErrorMessage("A participant with this phone number has already left early.");
      }
    }

    const admissionTime = new Date();
    let newPerson = {
      ...personData,
      id: 1000 + registrants.length,
      status: "admitted",
      admittedAt: admissionTime,
      leftAt: null,
      leaveReason: "",
      onSpot: true,
      certificateSent: false,
      passSent: false,
    };
    
    // Save to database if workshop is active
    if (currentWorkshopId) {
      const result = await workshopDB.addOnSpotParticipant(currentWorkshopId, personData);
      if (result.success) {
        // Use database ID
        newPerson = {
          ...newPerson,
          id: result.data.id
        };
      }
    }

    setRegistrants((prev) => [...prev, newPerson]);
    setCurrentCard(newPerson);

    // ✅ Auto-send pass via email (only if not already sent)
    if (!newPerson.passSent) {
      setTimeout(async () => {
        setPassesSending(true);
        const success = await generateAndSendPass(newPerson, currentWorkshopId);
        if (success) {
          setPassesSent(prev => prev + 1);
          // Mark as sent only after successful send
          setRegistrants(prev => prev.map(p => 
            p.id === newPerson.id ? { ...p, passSent: true } : p
          ));
          if (newPerson.id) {
            await workshopDB.updateParticipantDeliveryStatus(newPerson.id, 'pass', true);
          }
        } else {
          setPassesFailed(prev => prev + 1);
        }
        setPassesSending(false);
      }, 500);
    }
  };

  // --- [NEW] Handle Marking Early Leave ---
  const handleMarkLeaveEarly = (person) => {
    setPersonLeaving(person); // Open the modal
  };

  const handleSubmitLeaveEarly = (person, reason) => {
    console.log('\n👤 [WORKFLOW] Step 3c: Mark early leave...');
    console.log('   → Name:', person.name);
    console.log('   → Reason:', reason);
    
    // Verify the person is currently admitted
    const currentPerson = registrants.find(p => p.id === person.id);
    if (!currentPerson) {
      showErrorMessage("Participant not found.");
      setPersonLeaving(null);
      return;
    }

    if (currentPerson.status !== "admitted") {
      showErrorMessage("Only admitted participants can be marked as left early.");
      setPersonLeaving(null);
      return;
    }

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
    
    // Persist to database
    if (currentWorkshopId && person.id) {
      workshopDB.updateParticipantStatus(person.id, "left_early", {
        left_at: leaveTime.toISOString(),
        leave_reason: reason
      });
    }

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

  // --- Handler for certificate modal ---
  const handleGenerateCertificate = (person) => {
    setPersonToCertify(person);
  };

  // --- Handler for Send Certificates button ---
  const handleSendCertificates = () => {
    const pendingCount = eligibleForCertificate.filter(p => !p.certificateSent).length;
    
    if (pendingCount === 0) {
      alert('All eligible participants have already received certificates.');
      return;
    }

    const confirmed = window.confirm(
      `Send certificates to ${pendingCount} eligible participant${pendingCount > 1 ? 's' : ''}?\n\n` +
      `This will email certificates to all participants who:\n` +
      `- Stayed for the required duration\n` +
      `- Have not already received a certificate\n\n` +
      `This action cannot be undone.`
    );

    if (confirmed) {
      setSendCertificatesPermission(true);
    }
  };

  // --- Handler for Import CSV button ---
  const handleImportCSVClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('\n📋 [WORKFLOW] Step 1: Importing CSV file...');
        console.log('   → File name:', file.name);
        console.log('   → File size:', file.size, 'bytes');
        
        try {
          const text = await file.text();
          console.log('   → Parsing CSV data...');
          const data = parseCSV(text);
          console.log('   → Parsed', data.length, 'participants');
          // Initialize certificateSent and passSent flags for each participant
          const dataWithFlags = data.map(person => ({
            ...person,
            certificateSent: false,
            passSent: false
          }));
          
          // Save to database if workshop is active
          if (currentWorkshopId) {
            const result = await workshopDB.bulkInsertParticipants(currentWorkshopId, dataWithFlags);
            if (result.success) {
              // Use the data returned from database (includes IDs)
              const convertedParticipants = result.data.map(p => ({
                id: p.id,
                name: p.name,
                email: p.email,
                phone: p.phone,
                department: p.department,
                year: p.year,
                diet: p.diet,
                status: p.status,
                admittedAt: p.admitted_at ? new Date(p.admitted_at) : null,
                leftAt: p.left_at ? new Date(p.left_at) : null,
                leaveReason: p.leave_reason,
                onSpot: p.on_spot,
                certificateSent: p.certificate_sent,
                passSent: p.pass_sent
              }));
              
              // Merge with existing registrants
              setRegistrants(prev => [...prev, ...convertedParticipants]);
              
              if (result.skipped > 0) {
                alert(`Imported ${result.inserted} participants. ${result.skipped} duplicates skipped.`);
              }
            } else {
              console.error('Database save failed:', result.error);
              alert('Warning: Participants loaded but not saved to database.');
              setRegistrants(dataWithFlags);
            }
          } else {
            // No active workshop, just load into memory
            setRegistrants(dataWithFlags);
          }
        } catch (error) {
          console.error('Error loading CSV:', error);
          alert('Failed to load CSV file. Please check the file format.');
        }
      }
    };
    input.click();
  };

  // --- State for middle panel search ---
  const [middlePanelSearchQuery, setMiddlePanelSearchQuery] = useState("");
  const [, setSelectedParticipant] = useState(null);

  // --- [MODIFIED] Main App Render (only happens *after* data is loaded) ---
  return (
    <div 
      className="h-screen flex font-sans overflow-hidden relative"
      style={{ 
        backgroundColor: colors.background.primary,
        gap: '12px',
        padding: '12px'
      }}
    >
      {/* Mantiz Title at Top */}
      <div
        style={{
          position: 'fixed',
          top: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          fontFamily: '"BBH Hegarty", sans-serif',
          fontWeight: '100',
          fontSize: '1.3rem',
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          pointerEvents: 'none'
        }}
      >
        Mantiz
      </div>
      {/* Left Sidebar - Icon Navigation */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        workshopState={workshopState}
        activeSubView={activeSubView}
        setActiveSubView={setActiveSubView}
      />
      
      {/* Combined Middle + Main Panel Container */}
      <div 
        className="flex-1 flex overflow-hidden rounded-xl mt-7"
        style={{ 
          backgroundColor: colors.background.primary,
          border: `1px solid ${colors.border.default}`,
          height: 'calc(100vh - 2.25rem - 24px + 72px)',
          marginRight: '-24px'
        }}
      >
        {/* Middle Panel - Context List */}
        <MiddlePanel
          currentView={currentView}
          registrants={registrants}
          onSelectParticipant={setSelectedParticipant}
          searchQuery={middlePanelSearchQuery}
          setSearchQuery={setMiddlePanelSearchQuery}
          onSelectCertAction={setSelectedCertAction}
          selectedCertAction={selectedCertAction}
        />
        
        {/* Main content area */}
        <div 
          className="flex-1 flex flex-col overflow-hidden overflow-x-hidden"
          style={{ backgroundColor: colors.background.secondary }}
        >
          {/* Content wrapper */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6">
          <GeneratedCard
            person={currentCard}
            onClose={() => setCurrentCard(null)}
          />

          {/* Certificate Modal Render (uses fixed template for display) */}
          {personToCertify && (
            <CertificateGenerator
              person={personToCertify}
              onClose={() => setPersonToCertify(null)}
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

          {/* [NEW] Settings Modal Render */}
          {showSettingsModal && (
            <SettingsModal
              onClose={() => setShowSettingsModal(false)}
            />
          )}

          {/* --- Error Message Display --- */}
          <ErrorMessage message={errorMessage} />

          {/* Dashboard View */}
          {currentView === "dashboard" && (
            <Dashboard
              workshopState={workshopState}
              timeLeft={timeLeft}
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
              onImportCSV={handleImportCSVClick}
              onStartWorkshop={handleStartWorkshop}
              onPauseWorkshop={handlePauseWorkshop}
              onResetWorkshop={handleResetWorkshop}
              durationHours={durationHours}
              setDurationHours={setDurationHours}
              durationMinutes={durationMinutes}
              setDurationMinutes={setDurationMinutes}
              passesSent={passesSentCount}
              passesFailed={passesFailed}
              passesSending={passesSending}
              certificatesSent={certificatesSentCount}
              certificatesFailed={certificatesFailed}
              certificatesSending={certificatesSending}
              eligibleForCertificate={eligibleForCertificate.length}
            />
          )}

          {/* Unified Check-in View */}
          {currentView === "checkin" && (
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
              capacityReached={capacityReached}
              activeSubView={activeSubView}
              setActiveSubView={setActiveSubView}
            />
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

          {/* --- Certificates Tab Content (Fixed Template) --- */}
          {currentView === "certificates" && (
            <div id="certificates-panel" className="h-full">
              {/* Show Pass Customization Panel when pass action is selected */}
              {selectedCertAction === 'pass' && (
                <PassCustomizationPanel
                  currentConfig={passTemplateConfig}
                  onSave={async (config, templatePath) => {
                    setPassTemplateConfig(config);
                    
                    // Save to database if workshop is active
                    if (currentWorkshopId) {
                      const result = await workshopDB.savePassTemplate(currentWorkshopId, {
                        bgColor: config.bgColor,
                        borderColor: config.borderColor,
                        titleColor: config.titleColor,
                        subtitleColor: config.subtitleColor,
                        textColor: config.textColor,
                        highlightBgColor: config.highlightBgColor,
                        accentColor: config.accentColor,
                        showLogos: config.showLogos,
                        borderWidth: config.borderWidth,
                        templateImageUrl: templatePath
                      });
                      
                      if (result.success) {
                        console.log('Pass template saved to database');
                      } else {
                        console.error('Failed to save template to database:', result.error);
                      }
                    }
                    
                    console.log('Pass template saved:', templatePath);
                    setSelectedCertAction(null); // Close panel after save
                  }}
                  onCancel={() => setSelectedCertAction(null)}
                />
              )}

              {/* Show Send Certificates Section when no action is selected */}
              {!selectedCertAction && (
                <div className="p-6">
                  <div 
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.background.tertiary,
                      border: `1px solid ${colors.border.default}`,
                    }}
                  >
                    <div>
                      <p 
                        className="text-sm font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        {eligibleForCertificate.filter(p => !p.certificateSent).length > 0 ? (
                          <>
                            <span 
                              className="text-2xl font-bold"
                              style={{ color: colors.accent.blurple }}
                            >
                              {eligibleForCertificate.filter(p => !p.certificateSent).length}
                            </span>
                            <span style={{ color: colors.text.secondary }}>
                              {' '}participant{eligibleForCertificate.filter(p => !p.certificateSent).length !== 1 ? 's' : ''} pending certificate delivery
                            </span>
                          </>
                        ) : (
                          <span style={{ color: colors.status.success }}>
                            ✓ All eligible participants have received certificates
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={handleSendCertificates}
                      disabled={workshopState !== 'finished' || certificatesSending || eligibleForCertificate.filter(p => !p.certificateSent).length === 0}
                      className="inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition duration-200"
                      style={{
                        backgroundColor: (workshopState !== 'finished' || certificatesSending || eligibleForCertificate.filter(p => !p.certificateSent).length === 0)
                          ? colors.background.hover
                          : colors.accent.blurple,
                        color: '#ffffff',
                        opacity: (workshopState !== 'finished' || certificatesSending || eligibleForCertificate.filter(p => !p.certificateSent).length === 0) ? 0.6 : 1,
                        cursor: (workshopState !== 'finished' || certificatesSending || eligibleForCertificate.filter(p => !p.certificateSent).length === 0) 
                          ? 'not-allowed' 
                          : 'pointer',
                      }}
                    >
                      <Award className="h-5 w-5 mr-2" />
                      {certificatesSending ? 'Sending...' : 'Send Certificates'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
        </div>
      </div>

      {/* Bottom Overlay Bar - User Profile & Actions */}
      <div 
        className="fixed flex items-center px-4 py-3 gap-3 rounded-lg"
        style={{
          left: '8px',
          bottom: '8px',
          right: 'auto',
          width: 'calc(50px + 280px + 15px)',
          backgroundColor: colors.background.tertiary,
          border: `1px solid ${colors.border.default}`,
          zIndex: 1000,
          height: '60px',
        }}
      >
        {/* User Profile Section */}
        <div className="flex items-center gap-3 flex-1">
          {/* Profile Avatar */}
          <div 
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: colors.background.primary,
              border: `2px solid ${colors.border.default}`,
            }}
          >
            <svg viewBox="0 0 768 768" className="w-7 h-7">
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
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <div 
              className="text-sm font-semibold"
              style={{ color: colors.text.primary }}
            >
              Admin
            </div>
            <div 
              className="text-xs flex items-center gap-1"
              style={{ color: colors.text.tertiary }}
            >
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.status.online }}
              />
              Online
            </div>
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-9 h-9 rounded flex items-center justify-center transition-colors"
          style={{
            color: colors.background.quaternary,
          }}
          title="Settings"
        >
          <Settings className="w-5 h-5" style={{ stroke: "#6b7280" }} />
        </button>
      </div>


    </div>
  );
}
