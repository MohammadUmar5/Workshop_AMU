import React from "react";
import {
  ClipboardCheck,
  UserPlus,
  DoorOpen,
  Clock,
  Users,
  TrendingUp,
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

  const getActiveTabName = () => {
    const tab = tabs.find((t) => t.id === activeTab);
    return tab ? tab.label : "Check-in";
  };

  return (
    <div className="-mx-6 -mt-6 bg-black min-h-screen">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-black">
        {/* Header with Active Tab Name */}
        <div className="px-6 py-4">
          <h1 className="text-3xl font-semibold text-white">
            {getActiveTabName()}
          </h1>
          <p className="text-sm text-[#b9bbbe] mt-1">
            Manage workshop participants
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 flex items-center gap-4 border-b border-[#2a2a2a]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubView(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                  isActive
                    ? "text-white"
                    : "text-[#b9bbbe] hover:text-[#dcddde]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5865f2]"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area Based on Active Tab */}
      <div className="bg-black">
        <div className="w-full">
          {/* Check-in Tab Content */}
          {activeTab === "checkin" && (
            <div className="bg-black px-6 py-6 pb-screen">
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
