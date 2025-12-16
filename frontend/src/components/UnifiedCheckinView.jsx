import React from "react";
import CheckinIdleImage from '../assets/Check-in.png';
import {
  ClipboardCheck,
  UserPlus,
  DoorOpen,
} from "lucide-react";
import {
  SearchResults,
  EarlyLeaveSearchResults,
  StatusMessage,
  OnSpotRegistration,
} from "./CheckinComponents";

export const UnifiedCheckinView = ({
  // Search states
  searchQuery,
  setSearchQuery,
  earlyLeaveSearchQuery,
  setEarlyLeaveSearchQuery,

  // Search results
  searchLogic,
  earlyLeaveSearchLogic,

  // Actions
  onValidate,
  onOnSpotRegister,
  onMarkLeaveEarly,

  // Workshop state
  workshopState,

  // Capacity
  capacityReached,

  // Active tab from sidebar
  activeSubView,
  setActiveSubView,
}) => {
  const workshopActive = workshopState === "active";
  const activeTab = activeSubView || "checkin";

  const tabs = [
    { id: "checkin", label: "Check-in", icon: ClipboardCheck },
    { id: "onspot", label: "On-Spot", icon: UserPlus },
    { id: "earlyleave", label: "Early Leave", icon: DoorOpen },
  ];

  return (
    <div className="-mx-6 -mt-6 bg-black min-h-screen flex flex-col">
      {/* Extended Navbar - Spans full width like Discord */}
      <div 
        className="sticky top-0 z-10 flex items-center px-4 py-3 border-b"
        style={{
          backgroundColor: 'transparent',
          borderColor: '#1e1f22',
          height: '44.5px',
        }}
      >
        {/* Check-in Title */}
        <div className="flex items-center gap-3 px-2">
          <ClipboardCheck className="h-5 w-5 text-[#80848e]" />
          <h1 className="text-base font-semibold text-white">
            Check-in
          </h1>
        </div>

        {/* Divider */}
        <div className="mx-3 h-6 w-px bg-[#3f4147]"></div>

        {/* Tab Buttons - Discord Style */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubView(tab.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm font-medium"
                style={{
                  backgroundColor: isActive ? '#5865f2' : 'transparent',
                  color: isActive ? '#ffffff' : '#b5bac1',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#35373c';
                    e.currentTarget.style.color = '#dbdee1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#b5bac1';
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area Based on Active Tab */}
      <div className="bg-black flex-1 overflow-y-auto">
        <div className="w-full h-full">
          {/* Check-in Tab Content */}
          {activeTab === "checkin" && (
            <div className="bg-black px-6 py-6 h-full">
              {workshopState === 'idle' ? (
                // Idle state - Show image when workshop hasn't started
                <div className="flex flex-col items-center justify-center h-full">
                  <div style={{ position: 'relative', marginBottom: '32px' }}>
                    {/* Glowing blurple effect */}
                    <div style={{
                      position: 'absolute',
                      top: '75%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '120%',
                      height: '120%',
                      background: 'radial-gradient(circle, rgba(88, 101, 242, 0.9) 0%, rgba(88, 101, 242, 0.2) 30%, transparent 100%)',
                      filter: 'blur(100px)',
                      zIndex: 0,
                    }}></div>
                    
                    {/* Image */}
                    <img 
                      src={CheckinIdleImage} 
                      alt="No check-ins" 
                      style={{ 
                        position: 'relative',
                        top: 90,
                        zIndex: 1,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        opacity: 0.95,
                        filter: 'drop-shadow(0 0 40px rgba(88, 101, 242, 0.6))'
                      }}
                    />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    No check-ins yet
                  </h3>
                  <p className="text-base text-[#b9bbbe]">
                    Let the workshop start
                  </p>
                </div>
              ) : (
                // Active state - Show normal form
                <>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Admit Pre-Registered Participant
                  </h3>
                  <div>
                    <label
                      htmlFor="admit-search"
                      className="block text-sm font-medium text-[#b9bbbe] mb-2"
                    >
                      Search Pre-Registered
                    </label>
                    <input
                      type="text"
                      id="admit-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name, email, or phone..."
                      disabled={!workshopActive}
                      className="w-full p-3 bg-[#000000] border border-[#2a2a2a] rounded-lg text-white placeholder-[#72767d] focus:ring-2 focus:ring-[#3ba55d] focus:border-[#3ba55d] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="mt-4">
                    {searchLogic.status === "found" ? (
                      <SearchResults
                        results={searchLogic.results}
                        onValidate={onValidate}
                        workshopActive={workshopActive}
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
                </>
              )}
            </div>
          )}

          {/* On-Spot Tab Content */}
          {activeTab === "onspot" && (
            <div className="bg-black shadow-md px-6 py-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Register Walk-in Participant
              </h3>
              <OnSpotRegistration
                onRegister={onOnSpotRegister}
                workshopActive={workshopActive}
                capacityReached={capacityReached}
              />
            </div>
          )}

          {/* Early Leave Tab Content */}
          {activeTab === "earlyleave" && (
            <div className="bg-black shadow-md px-6 py-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Mark Participant as Left Early
              </h3>
              <div>
                <label
                  htmlFor="leave-search"
                  className="block text-sm font-medium text-[#b9bbbe] mb-2"
                >
                  Search Admitted Participant
                </label>
                <input
                  type="text"
                  id="leave-search"
                  value={earlyLeaveSearchQuery}
                  onChange={(e) => setEarlyLeaveSearchQuery(e.target.value)}
                  placeholder="Name, email, or phone..."
                  disabled={!workshopActive}
                  className="w-full p-3 bg-[#000000] border border-[#2a2a2a] rounded-lg text-white placeholder-[#72767d] focus:ring-2 focus:ring-[#faa61a] focus:border-[#faa61a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="mt-4">
                {earlyLeaveSearchLogic.status === "found" ? (
                  <EarlyLeaveSearchResults
                    results={earlyLeaveSearchLogic.results}
                    onMarkLeave={onMarkLeaveEarly}
                    workshopActive={workshopActive}
                  />
                ) : (
                  <StatusMessage
                    status={earlyLeaveSearchLogic.status}
                    query={earlyLeaveSearchQuery.trim()}
                    type="early_leave"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
