import React, { useState } from 'react';
import { Search, UserPlus, LogOut, Sparkles, Award, ChevronDown, ChevronRight, BarChart3, Settings, UserCheck, UserX, ArrowRight } from 'lucide-react';

export const Sidebar = ({ currentView, setCurrentView, workshopState, activeSubView, setActiveSubView }) => {
  const [isCheckinExpanded, setIsCheckinExpanded] = useState(true);

  const handleCheckinClick = () => {
    setIsCheckinExpanded(!isCheckinExpanded);
    if (!isCheckinExpanded) {
      setCurrentView('checkin');
      if (setActiveSubView) setActiveSubView('checkin');
    }
  };

  const handleSubViewClick = (subView) => {
    setCurrentView('checkin');
    if (setActiveSubView) setActiveSubView(subView);
  };

  const isCheckinActive = currentView === 'checkin';

  return (
    <div className="w-52 bg-gray-100 rounded-r-2xl flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Header with app title */}
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/7/7c/Logo-aps-no-tagline.svg" 
            alt="APS Logo" 
            className="h-6 w-auto flex-shrink-0"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1 className="text-xl font-semibold text-gray-900">Workshop</h1>
        </div>
      </div>
      
      {/* Navigation section */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main Section */}
        <div className="space-y-1">
          <h2 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Main
          </h2>
          
          {/* Dashboard */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === 'dashboard'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          
          {/* Check-in with expandable sub-menu */}
          <div>
            <button
              onClick={handleCheckinClick}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isCheckinActive
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Check-in</span>
              </div>
              {isCheckinExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {/* Sub-menu items */}
            {isCheckinExpanded && (
              <div className="ml-6 mt-1 space-y-1 border-l border-gray-200">
                <button
                  onClick={() => handleSubViewClick('checkin')}
                  className={`w-full flex items-center gap-2 pl-4 pr-3 py-1.5 text-sm rounded-md transition-colors ${
                    isCheckinActive && activeSubView === 'checkin'
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Admit</span>
                </button>

                <button
                  onClick={() => handleSubViewClick('onspot')}
                  className={`w-full flex items-center gap-2 pl-4 pr-3 py-1.5 text-sm rounded-md transition-colors ${
                    isCheckinActive && activeSubView === 'onspot'
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>On-Spot</span>
                </button>

                <button
                  onClick={() => handleSubViewClick('earlyleave')}
                  className={`w-full flex items-center gap-2 pl-4 pr-3 py-1.5 text-sm rounded-md transition-colors ${
                    isCheckinActive && activeSubView === 'earlyleave'
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <UserX className="h-4 w-4" />
                  <span>Early Leave</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* General Section */}
        <div className="space-y-1">
          <h2 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            General
          </h2>
          
          {/* AI Tools */}
          <button
            onClick={() => setCurrentView('ai')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === 'ai'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Tools</span>
          </button>
          
          {/* Certificates button - only show when workshop finished */}
          {workshopState === 'finished' && (
            <button
              onClick={() => setCurrentView('certificates')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'certificates'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Certificates</span>
            </button>
          )}
          
          {/* Settings */}
          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === 'settings'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </nav>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2025 Workshop System
        </p>
      </div>
    </div>
  );
};
