import React, { useState, useRef } from 'react';
import {
  UserCheck, UserX, UserSearch, X,
  Mail, Phone, BookOpen, Building, Coffee, CheckCircle,
  Download,
  Clock,
  UserPlus,
  LogOut,
  Save
} from 'lucide-react';
import { GeminiIcebreaker } from './GeminiComponents';
import { sendPassEmail } from '../utils/emailService';

// GeneratedCard Component
export const GeneratedCard = ({ person, onClose }) => {
  const cardContentRef = useRef(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'success', 'error', or null

  if (!person) return null;

const handleDownload = () => {
  if (cardContentRef.current && typeof window.htmlToImage?.toPng === 'function') {
    window.htmlToImage.toPng(cardContentRef.current, {
      backgroundColor: '#f0f9ff',
      pixelRatio: 2, // Equivalent to scale: 2
      cacheBust: true
    }).then((dataUrl) => {
      const link = document.createElement('a');
      const fileName = person.name.replace(/ /g, '_').toLowerCase();
      link.href = dataUrl;
      link.download = `${fileName}_workshop_pass.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch((error) => {
      console.error("html-to-image error:", error);
    });
  } else {
    console.error("html-to-image script not loaded yet or failed to load.");
  }
};

const handleSendEmail = async () => {
  if (!cardContentRef.current || typeof window.htmlToImage?.toPng !== 'function') {
    console.error("html-to-image script not loaded yet or failed to load.");
    setEmailStatus('error');
    setTimeout(() => setEmailStatus(null), 3000);
    return;
  }

  setEmailSending(true);
  setEmailStatus(null);

  try {
    // Generate PNG from the card
    const passImageBase64 = await window.htmlToImage.toPng(cardContentRef.current, {
      backgroundColor: '#f0f9ff',
      pixelRatio: 2,
      cacheBust: true
    });

    const admissionTime = person.admittedAt 
      ? new Date(person.admittedAt).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true, 
          timeZone: 'Asia/Kolkata' 
        })
      : 'N/A';

    // Send email with the generated pass
    await sendPassEmail({
      email: person.email,
      name: person.name,
      subject: 'Workshop Check-in Confirmation - Your Pass',
      text: `Hello ${person.name},\n\nThank you for checking in to the workshop!\n\nYour workshop pass is attached to this email. Please keep it for your records.\n\nWorkshop Details:\n- Department: ${person.department}\n- Year: ${person.year}\n- Refreshment: ${person.diet || 'Not Specified'}\n- Admission Time: ${admissionTime}\n\nBest regards,\nWorkshop Team`,
      html: `
        <p>Hello <strong>${person.name}</strong>,</p>
        <p>Thank you for checking in to the workshop!</p>
        <p>Your workshop pass is attached to this email. Please keep it for your records.</p>
        <h3>Workshop Details:</h3>
        <ul>
          <li><strong>Department:</strong> ${person.department}</li>
          <li><strong>Year:</strong> ${person.year}</li>
          <li><strong>Refreshment:</strong> ${person.diet || 'Not Specified'}</li>
          <li><strong>Admission Time:</strong> ${admissionTime}</li>
        </ul>
        <p>Best regards,<br><strong>Workshop Team</strong></p>
      `,
      filename: `${person.name.replace(/ /g, '_').toLowerCase()}_workshop_pass.png`,
      attachmentBase64: passImageBase64
    });

    console.log(`Pass email sent to ${person.email}`);
    setEmailStatus('success');
    setTimeout(() => setEmailStatus(null), 3000);
  } catch (error) {
    console.error(`Failed to send pass email to ${person.email}`, error);
    setEmailStatus('error');
    setTimeout(() => setEmailStatus(null), 3000);
  } finally {
    setEmailSending(false);
  }
};
  
  const admissionTime = person.admittedAt 
    ? new Date(person.admittedAt).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true, 
        timeZone: 'Asia/Kolkata' 
      })
    : 'N/A';

  return (
    <div className="relative p-6 mb-6 animate-pulse-once">
      <style>{`
        @keyframes pulse-once {
          0% { transform: scale(0.98); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-once {
          animation: pulse-once 0.5s ease-out;
        }
      `}</style>
      
      <button 
        onClick={onClose} 
        className="absolute -top-3 -right-3 z-10 bg-white rounded-full p-1 text-gray-500 hover:text-gray-800 transition shadow-lg border"
        aria-label="Close Card"
      >
        <X className="h-6 w-6" />
      </button>

      <div 
        ref={cardContentRef} 
        data-pass-card="true"
        className="p-6 bg-white border-2 border-gray-300 rounded-lg shadow-lg"
      >
        <div className="flex items-center pb-4 border-b border-gray-200">
          <CheckCircle className="h-10 w-10 text-green-600 mr-4 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{person.name}</h2>
            <p className="text-lg font-medium text-gray-700">Has Been Admitted</p>
          </div>
        </div>

        <div className="mt-5 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Refreshment Preference</h3>
          <p className="flex items-center text-2xl font-bold text-indigo-700 mt-2">
            <Coffee className="h-6 w-6 mr-3" />
            {person.diet || 'Not Specified'}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-800">
          <div className="flex items-center">
            <Building className="h-5 w-5 mr-3 text-gray-500" />
            <strong className="break-words" title={person.department}>{person.department}</strong>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-3 text-gray-500" />
            Year: <b>{person.year}</b>
          </div>
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-3 text-gray-500" />
            {person.phone}
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-3 text-gray-500" />
            <span className="break-words" title={person.email}>{person.email}</span>
          </div>
          <div className="flex items-center md:col-span-2">
            <Clock className="h-5 w-5 mr-3 text-gray-500" />
            Admitted at: <b>{admissionTime}</b>
          </div>
        </div>
        
        <GeminiIcebreaker person={person} />
        
        <div className="mt-6 pt-4 border-t border-blue-200 flex items-center justify-between">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/7/7c/Logo-aps-no-tagline.svg" 
            alt="APS Logo" 
            className="h-9 w-auto object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/150x50/ffffff/333333?text=APS+Logo';
              e.target.alt = "APS Logo Placeholder";
            }}
          />
          <img 
            src="https://olympiaacademia.github.io/images/logo.png" 
            alt="Olympia Academia Logo" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/150x50/ffffff/333333?text=Olympia+Academia';
              e.target.alt = "Olympia Academia Logo Placeholder";
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
        >
          <Download className="h-5 w-5 mr-2" />
          Download Pass
        </button>
        
        <button
          onClick={handleSendEmail}
          disabled={emailSending}
          className={`inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ${
            emailSending 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : emailStatus === 'success'
              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              : emailStatus === 'error'
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          <Mail className="h-5 w-5 mr-2" />
          {emailSending ? 'Sending...' : emailStatus === 'success' ? 'Email Sent!' : emailStatus === 'error' ? 'Failed' : 'Send via Email'}
        </button>
      </div>
      
      {emailStatus && (
        <div className={`mt-3 text-center text-sm font-medium ${
          emailStatus === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {emailStatus === 'success' 
            ? `✓ Pass sent to ${person.email}` 
            : '✗ Failed to send email. Please try again.'}
        </div>
      )}
    </div>
  );
};

// SearchResults Component
export const SearchResults = ({ results, onValidate, workshopActive, capacityReached }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-600 mb-3">
      {results.length} matching registration{results.length !== 1 ? 's' : ''}
    </h3>
    <ul className="space-y-3">
      {results.map((person) => (
        <li 
          key={person.id} 
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between"
        >
          <div className="mb-3 sm:mb-0">
            <p className="font-bold text-lg text-gray-900">{person.name}</p>
            <div className="mt-1 text-sm text-gray-600">
              <p className="truncate" title={person.email}>{person.email}</p>
              <p>{person.phone}</p>
            </div>
          </div>
          <button
            onClick={() => onValidate(person.id)}
            disabled={!workshopActive || capacityReached} 
            className={`px-4 py-2 font-semibold rounded-lg shadow-md transition duration-200 flex items-center w-full sm:w-auto justify-center ${
              (workshopActive && !capacityReached)
                ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' 
                : 'bg-gray-400 text-gray-100 cursor-not-allowed'
            }`}
          >
            <UserCheck className="h-5 w-5 mr-2" />
            Admit
          </button>
        </li>
      ))}
    </ul>
  </div>
);

// EarlyLeaveSearchResults Component
export const EarlyLeaveSearchResults = ({ results, onMarkLeave, workshopActive }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-600 mb-3">
      {results.length} admitted participant{results.length !== 1 ? 's' : ''}
    </h3>
    <ul className="space-y-3">
      {results.map((person) => (
        <li 
          key={person.id} 
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between"
        >
          <div className="mb-3 sm:mb-0">
            <p className="font-bold text-lg text-gray-900">{person.name}</p>
            <div className="mt-1 text-sm text-gray-600">
              <p className="truncate" title={person.email}>{person.email}</p>
              <p>{person.phone}</p>
            </div>
          </div>
          <button
            onClick={() => onMarkLeave(person)}
            disabled={!workshopActive} 
            className={`px-4 py-2 font-semibold rounded-lg shadow-md transition duration-200 flex items-center w-full sm:w-auto justify-center ${
              workshopActive
                ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500' 
                : 'bg-gray-400 text-gray-100 cursor-not-allowed'
            }`}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Mark as Left
          </button>
        </li>
      ))}
    </ul>
  </div>
);

// StatusMessage Component
export const StatusMessage = ({ status, query, type = 'checkin' }) => {
  const messages = {
    checkin: {
      idle: "Enter name, email, or phone to search",
      notFound: "Not Registered",
      notFoundQuery: `No match found for "${query}"`
    },
    early_leave: {
      idle: "Search for admitted participant",
      notFound: "Not Found",
      notFoundQuery: `No admitted participant found for "${query}"`
    }
  };
  
  const msg = messages[type] || messages.checkin;

  if (status === 'idle') {
    return (
      <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm">
        <UserSearch className="h-5 w-5 mr-2 flex-shrink-0" />
        <p>{msg.idle}</p>
      </div>
    );
  }

  if (status === 'notFound') {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <div className="flex items-center mb-1">
          <UserX className="h-5 w-5 mr-2 flex-shrink-0" />
          <h3 className="font-bold text-sm">{msg.notFound}</h3>
        </div>
        <p className="text-xs ml-7">{msg.notFoundQuery}</p>
      </div>
    );
  }
  
  return null;
};

// OnSpotRegistration Component
export const OnSpotRegistration = ({ onRegister, workshopActive, capacityReached }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [diet, setDiet] = useState('Vegetarian');
  const [formError, setFormError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setFormError('Full Name, Email, and Phone are required.');
      setTimeout(() => setFormError(''), 3000);
      return;
    }
    
    onRegister({
      name, email, phone, department, year, diet
    });
    
    setName('');
    setEmail('');
    setPhone('');
    setDepartment('');
    setYear('');
    setDiet('Vegetarian');
    setFormError('');
  };

  const isDisabled = !workshopActive || capacityReached;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="spot-name" className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input 
              type="text" id="spot-name" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              disabled={isDisabled}
            />
          </div>
          <div>
            <label htmlFor="spot-email" className="block text-sm font-medium text-gray-700">Email *</label>
            <input 
              type="email" id="spot-email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              disabled={isDisabled}
            />
          </div>
          <div>
            <label htmlFor="spot-phone" className="block text-sm font-medium text-gray-700">Phone *</label>
            <input 
              type="tel" id="spot-phone" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              disabled={isDisabled}
            />
          </div>
          <div>
            <label htmlFor="spot-year" className="block text-sm font-medium text-gray-700">Year of Study</label>
            <input 
              type="text" id="spot-year" value={year} onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              disabled={isDisabled}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="spot-dept" className="block text-sm font-medium text-gray-700">Department</label>
            <input 
              type="text" id="spot-dept" value={department} onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              disabled={isDisabled}
            />
          </div>
          <div>
            <label htmlFor="spot-diet" className="block text-sm font-medium text-gray-700">Dietary Preference</label>
            <select 
              id="spot-diet" value={diet} onChange={(e) => setDiet(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              disabled={isDisabled}
            >
              <option>Vegetarian</option>
              <option>Non-vegetarian</option>
              <option>Other (please specify)</option>
            </select>
          </div>
        </div>
        
        {formError && (
          <p className="text-sm text-red-600">{formError}</p>
        )}
        
        <button
          type="submit"
          disabled={isDisabled}
          className={`w-full inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg shadow-md transition duration-200 text-lg ${
            isDisabled 
              ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          <UserPlus className="h-6 w-6 mr-2" />
          Register & Admit
        </button>
      </form>
    </div>
  );
};

// EarlyLeaveModal Component
export const EarlyLeaveModal = ({ person, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  
  if (!person) return null;

  const handleSubmit = () => {
    onSubmit(person, reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mark Early Leave</h2>
        <p className="text-lg mb-4">
          You are marking <strong className="text-indigo-600">{person.name}</strong> as leaving early.
        </p>
        
        <div>
          <label htmlFor="leave-reason" className="block text-sm font-medium text-gray-700">
            Reason for leaving (Optional)
          </label>
          <textarea
            id="leave-reason"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="e.g., Family emergency, not feeling well..."
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-4">
          <button 
            onClick={handleSubmit}
            className="inline-flex items-center justify-center px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-200"
          >
            <Save className="h-5 w-5 mr-2" />
            Confirm Early Leave
          </button>
          <button 
            onClick={onClose} 
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};