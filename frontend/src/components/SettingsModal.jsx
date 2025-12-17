import React, { useState } from "react";
import { X, Settings as SettingsIcon, Clock, Mail, Palette, Database, Info } from "lucide-react";
import { colors } from "../theme/colors";

export const SettingsModal = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState("workshop");

  const sections = [
    { id: "workshop", label: "Workshop", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Mail },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "data", label: "Data & Privacy", icon: Database },
    { id: "about", label: "About", icon: Info },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "workshop":
        return <WorkshopSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "data":
        return <DataSettings />;
      case "about":
        return <AboutSettings />;
      default:
        return <WorkshopSettings />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4" style={{ zIndex: 1001 }}>
      <div 
        className="rounded-lg shadow-2xl flex overflow-hidden"
        style={{ 
          width: "90vw", 
          maxWidth: "1000px", 
          height: "85vh", 
          maxHeight: "700px",
          border: `1px solid ${colors.border.default}`
        }}
      >
        {/* Left Sidebar */}
        <div 
          className="w-64 flex-shrink-0 flex flex-col"
          style={{ 
            backgroundColor: colors.background.secondary,
            borderRight: `1px solid ${colors.border.default}`
          }}
        >
          {/* Header */}
          <div 
            className="p-4 border-b" 
            style={{ borderColor: colors.border.default }}
          >
            <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>Settings</h2>
          </div>

          {/* Navigation */}
          <nav className="p-2 flex-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors mb-1"
                  style={{
                    backgroundColor: isActive ? colors.background.tertiary : "transparent",
                    color: isActive ? colors.text.primary : colors.text.tertiary,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = colors.background.hover;
                      e.currentTarget.style.color = colors.text.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = colors.text.tertiary;
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div 
          className="flex-1 flex flex-col overflow-hidden" 
          style={{ backgroundColor: colors.background.tertiary }}
        >
          {/* Content Header */}
          <div 
            className="p-6 border-b flex items-center justify-between" 
            style={{ borderColor: colors.border.default }}
          >
            <div>
              <h3 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                {sections.find(s => s.id === activeSection)?.label}
              </h3>
              <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                {getSectionDescription(activeSection)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded flex items-center justify-center transition-colors"
              style={{ 
                color: colors.text.secondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Components
const WorkshopSettings = () => {
  return (
    <div className="space-y-6">
      <Section title="Default Workshop Settings">
        <SettingItem
          label="Default Duration"
          description="Set default workshop duration when starting a new workshop"
        >
          <div className="flex gap-2">
            <input
              type="number"
              defaultValue="2"
              min="0"
              max="24"
              className="w-20 px-3 py-2 rounded text-white focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.background.input,
                border: `1px solid ${colors.border.default}`,
                color: colors.text.primary,
                focusRingColor: colors.border.focus
              }}
            />
            <span className="self-center" style={{ color: colors.text.tertiary }}>hours</span>
            <input
              type="number"
              defaultValue="30"
              min="0"
              max="59"
              className="w-20 px-3 py-2 rounded text-white focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.background.input,
                border: `1px solid ${colors.border.default}`,
                color: colors.text.primary,
                focusRingColor: colors.border.focus
              }}
            />
            <span className="self-center" style={{ color: colors.text.tertiary }}>minutes</span>
          </div>
        </SettingItem>

        <SettingItem
          label="Workshop Capacity"
          description="Maximum number of participants allowed"
        >
          <input
            type="number"
            defaultValue="75"
            min="1"
            className="w-32 px-3 py-2 rounded text-white focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.background.input,
              border: `1px solid ${colors.border.default}`,
              color: colors.text.primary,
              focusRingColor: colors.border.focus
            }}
          />
        </SettingItem>

        <SettingItem
          label="Certificate Threshold"
          description="Minutes before workshop end that participants must stay to be eligible for certificates"
        >
          <div className="flex gap-2 items-center">
            <input
              type="number"
              defaultValue="0"
              min="0"
              className="w-24 px-3 py-2 rounded text-white focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.background.input,
                border: `1px solid ${colors.border.default}`,
                color: colors.text.primary,
                focusRingColor: colors.border.focus
              }}
            />
            <span style={{ color: colors.text.tertiary }}>minutes</span>
          </div>
        </SettingItem>
      </Section>
    </div>
  );
};

const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      <Section title="Email Notifications">
        <ToggleSetting
          label="Auto-send Passes"
          description="Automatically send workshop passes via email when participants are admitted"
          defaultChecked={true}
        />

        <ToggleSetting
          label="Auto-send Certificates"
          description="Automatically send certificates to eligible participants when workshop finishes"
          defaultChecked={false}
        />
      </Section>

      <Section title="Email Templates">
        <SettingItem
          label="Pass Email Subject"
          description="Default subject line for pass emails"
        >
          <input
            type="text"
            defaultValue="Workshop Check-in Confirmation - Your Pass"
            className="w-full px-3 py-2 rounded text-white focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.background.input,
              border: `1px solid ${colors.border.default}`,
              color: colors.text.primary,
              focusRingColor: colors.border.focus
            }}
          />
        </SettingItem>

        <SettingItem
          label="Certificate Email Subject"
          description="Default subject line for certificate emails"
        >
          <input
            type="text"
            defaultValue="Workshop Certificate of Participation"
            className="w-full px-3 py-2 rounded text-white focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.background.input,
              border: `1px solid ${colors.border.default}`,
              color: colors.text.primary,
              focusRingColor: colors.border.focus
            }}
          />
        </SettingItem>
      </Section>
    </div>
  );
};

const AppearanceSettings = () => {
  return (
    <div className="space-y-6">
      <Section title="Theme">
        <SettingItem
          label="Color Scheme"
          description="Choose your preferred color theme"
        >
          <select 
            className="w-48 px-3 py-2 rounded text-white focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.background.input,
              border: `1px solid ${colors.border.default}`,
              color: colors.text.primary,
              focusRingColor: colors.border.focus
            }}
          >
            <option>Dark (Default)</option>
            <option disabled>Light (Coming Soon)</option>
          </select>
        </SettingItem>
      </Section>

      <Section title="Display">
        <ToggleSetting
          label="Show Participant Counts"
          description="Display participant statistics in dashboard"
          defaultChecked={true}
        />

        <ToggleSetting
          label="Show Timer"
          description="Display workshop countdown timer"
          defaultChecked={true}
        />
      </Section>
    </div>
  );
};

const DataSettings = () => {
  return (
    <div className="space-y-6">
      <Section title="Data Export">
        <SettingItem
          label="Export Format"
          description="Choose default format for exporting participant data"
        >
          <select 
            className="w-48 px-3 py-2 rounded text-white focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.background.input,
              border: `1px solid ${colors.border.default}`,
              color: colors.text.primary,
              focusRingColor: colors.border.focus
            }}
          >
            <option>CSV</option>
            <option disabled>JSON (Coming Soon)</option>
            <option disabled>Excel (Coming Soon)</option>
          </select>
        </SettingItem>
      </Section>

      <Section title="Privacy">
        <SettingItem
          label="Data Retention"
          description="How long to keep workshop data"
        >
          <select 
            className="w-48 px-3 py-2 rounded text-white focus:outline-none focus:ring-2"
            style={{
              backgroundColor: colors.background.input,
              border: `1px solid ${colors.border.default}`,
              color: colors.text.primary,
              focusRingColor: colors.border.focus
            }}
          >
            <option>Keep all data</option>
            <option disabled>30 days (Coming Soon)</option>
            <option disabled>90 days (Coming Soon)</option>
          </select>
        </SettingItem>
      </Section>
    </div>
  );
};

const AboutSettings = () => {
  return (
    <div className="space-y-6">
      <Section title="Application Information">
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-1">Workshop Management System</h4>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Version 1.0.0
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">Developed by</h4>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Olympia Academia, AMU
            </p>
          </div>
        </div>
      </Section>

      <Section title="Support">
        <p className="text-sm" style={{ color: colors.text.secondary }}>
          For support or questions, please contact the workshop team.
        </p>
      </Section>
    </div>
  );
};

// Helper Components
const Section = ({ title, children }) => {
  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

const SettingItem = ({ label, description, children }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-white mb-1">{label}</label>
        {description && (
          <p className="text-xs" style={{ color: colors.text.tertiary }}>
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
};

const ToggleSetting = ({ label, description, defaultChecked = false }) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-white mb-1">{label}</label>
        {description && (
          <p className="text-xs" style={{ color: colors.text.tertiary }}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: checked ? colors.accent.blurple.DEFAULT : colors.background.input,
          focusRingColor: colors.border.focus
        }}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

const getSectionDescription = (sectionId) => {
  const descriptions = {
    workshop: "Configure default workshop settings and preferences",
    notifications: "Manage email notifications and templates",
    appearance: "Customize the look and feel of the application",
    data: "Export data and manage privacy settings",
    about: "Application information and support",
  };
  return descriptions[sectionId] || "";
};
