import React, { useRef } from 'react';
import { Download, Award, Palette, X } from 'lucide-react';
import { colorPalette, fontOptions } from '../constants/constants';

// --- Certificate Border Component ---
export const CertificateBorder = ({ borderStyle, children }) => {
  if (borderStyle === 'double') {
    return (
      <div className="border-2 border-gray-500 p-2">
        <div className="border-[6px] border-indigo-700 p-8">
          {children}
        </div>
      </div>
    );
  }
  if (borderStyle === 'ornate-gold') {
    return (
      <div className="border-12 border-double p-8"
           style={{ borderColor: '#D4AF37', backgroundImage: 'linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)', borderImageSlice: 1 }}>
        {children}
      </div>
    );
  }
   if (borderStyle === 'none') {
    return <div className="p-8">{children}</div>;
  }
  // Default ('simple')
  return (
    <div className="border-8 border-indigo-800 p-8">
      {children}
    </div>
  );
};

// --- Certificate Generator Component ---
export const CertificateGenerator = ({ person, onClose, certBody, nameFont, sigFont, certBg, certBorder, certTitleFont }) => {
  const certificateRef = useRef(null);

  if (!person) return null;

  // --- Download Handler ---
  const handleDownload = () => {
  if (certificateRef.current && typeof window.htmlToImage?.toPng === 'function') {
    const bgColor = colorPalette.find(c => c.name === certBg)?.hex || '#FFFFFF';
    window.htmlToImage.toPng(certificateRef.current, {
      backgroundColor: bgColor,
      pixelRatio: 2, // Equivalent to scale: 2
      cacheBust: true
    }).then((dataUrl) => {
      const link = document.createElement('a');
      const fileName = person.name.replace(/ /g, '_').toLowerCase();
      link.href = dataUrl;
      link.download = `${fileName}_certificate.png`;
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

  // Font class logic
  const getFontClass = (fontValue) => {
    switch (fontValue) {
      case 'cursive': return "font-['Great_Vibes',_cursive]";
      case 'handwriting': return "font-['Dancing_Script',_cursive]";
      case 'script-pacifico': return "font-['Pacifico',_cursive]";
      case 'script-tangerine': return "font-['Tangerine',_cursive]";
      case 'handwriting-caveat': return "font-['Caveat',_cursive]";
      case 'casual-patrick': return "font-['Patrick_Hand',_cursive]";
      
      case 'elegant-serif': return "font-['Playfair_Display',_serif]";
      case 'serif': return "font-['Merriweather',_serif]";
      case 'serif-lora': return "font-['Lora',_serif]";
      case 'serif-zilla': return "font-['Zilla_Slab',_serif]";
      case 'serif-old-tt': return "font-['Old_Standard_TT',_serif]";
      case 'serif-arvo': return "font-['Arvo',_serif]";
      
      case 'sans': return "font-['Inter',_sans-serif]";
      case 'sans-montserrat': return "font-['Montserrat',_sans-serif]";
      case 'sans-nunito': return "font-['Nunito',_sans-serif]";

      case 'mono': return "font-['Roboto_Mono',_monospace]";
      default: return "font-['Inter',_sans-serif]";
    }
  };

  const nameFontClass = getFontClass(nameFont);
  const sigFontClass = getFontClass(sigFont);
  const titleFontClass = getFontClass(certTitleFont);
  const bodyFontClass = "font-['Merriweather',_serif]";
  const bgColorHex = colorPalette.find(c => c.name === certBg)?.hex || '#FFFFFF';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:wght@700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Tangerine:wght@700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
      `}</style>

      <div className="bg-white rounded-lg shadow-2xl p-4 md:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        <div 
          ref={certificateRef} 
          className={`p-6 md:p-10 border border-gray-400 ${bodyFontClass} w-full`}
          style={{ backgroundColor: bgColorHex }}
        >
          <CertificateBorder borderStyle={certBorder}>
            <div className="text-center">
              <div className="flex justify-between items-center mb-8">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/en/7/7c/Logo-aps-no-tagline.svg" 
                  alt="APS Logo" 
                  className="h-16 w-auto object-contain"
                />
                <img 
                  src="https://olympiaacademia.github.io/images/logo.png" 
                  alt="Olympia Academia Logo" 
                  className="h-20 w-auto object-contain"
                />
              </div>

              <h1 className={`text-3xl md:text-5xl font-bold text-indigo-700 mb-6 ${titleFontClass}`}>
                Certificate of Participation
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                This certificate is proudly presented to
              </p>

              <h2 className={`text-5xl md:text-7xl font-bold text-gray-900 mb-8 ${nameFontClass}`}>
                {person.name}
              </h2>

              <p className="text-lg md:text-xl text-gray-700 mb-10 whitespace-pre-line">
                {certBody}
              </p>

              <div className="flex justify-center mt-16">
                  <div className="text-center w-80">
                    <p className={`text-3xl font-medium text-gray-800 ${sigFontClass} pb-1`}>Muneeb Basu</p>
                    <hr className="border-gray-700" />
                    <p className="text-sm text-gray-600 uppercase tracking-wider mt-2">President, Olympia Academia, AMU</p>
                    <p className="text-sm text-gray-600 uppercase tracking-wider">Student Ambassador, APS</p>
                  </div>
              </div>
            </div>
          </CertificateBorder>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
          >
            Close
          </button>
          <button 
            onClick={handleDownload}
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Certificate
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Certificate Design Panel ---
export const CertificateDesigner = ({ 
  certBody, setCertBody, 
  nameFont, setNameFont, 
  sigFont, setSigFont,
  certBg, setCertBg,
  certBorder, setCertBorder,
  certTitleFont, setCertTitleFont,
  threshold, setThreshold, 
  eligibleCount,
  onSendCertificates,
  certificatesSending,
  eligibleParticipants = []
}) => {
  const pendingCount = eligibleParticipants.filter(p => !p.certificateSent).length;

  const borderOptions = [
    { name: 'Simple (Default)', value: 'simple' },
    { name: 'Double', value: 'double' },
    { name: 'Ornate (Gold)', value: 'ornate-gold' },
    { name: 'None', value: 'none' },
  ];

  return (
    <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Palette className="h-6 w-6 mr-2 text-indigo-600" />
        Customize Certificate
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="cert-body" className="block text-sm font-medium text-gray-700">Certificate Body Text</label>
          <textarea
            id="cert-body"
            rows="3"
            value={certBody}
            onChange={(e) => setCertBody(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cert-title-font" className="block text-sm font-medium text-gray-700">Title Font</label>
            <select
              id="cert-title-font"
              value={certTitleFont}
              onChange={(e) => setCertTitleFont(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              {fontOptions.map(font => (
                <option key={font.value} value={font.value}>{font.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cert-font" className="block text-sm font-medium text-gray-700">Participant Name Font</label>
            <select
              id="cert-font"
              value={nameFont}
              onChange={(e) => setNameFont(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              {fontOptions.map(font => (
                <option key={font.value} value={font.value}>{font.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sig-font" className="block text-sm font-medium text-gray-700">Signature Font</label>
            <select
              id="sig-font"
              value={sigFont}
              onChange={(e) => setSigFont(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              {fontOptions.map(font => (
                <option key={font.value} value={font.value}>{font.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cert-border" className="block text-sm font-medium text-gray-700">Border Style</label>
            <select
              id="cert-border"
              value={certBorder}
              onChange={(e) => setCertBorder(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              {borderOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cert-bg" className="block text-sm font-medium text-gray-700">Background Color</label>
            <select
              id="cert-bg"
              value={certBg}
              onChange={(e) => setCertBg(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              {colorPalette.map(color => (
                <option key={color.name} value={color.name}>{color.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-300">
        <h3 className="text-lg font-semibold text-gray-800">Certificate Eligibility</h3>
        <p className="text-sm text-gray-600 mb-2">
          Set a minimum attendance time. Participants who left early but stayed for at least this duration will be eligible for a certificate.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="threshold-minutes" className="block text-sm font-medium text-gray-700">
              Allow leaving up to (minutes before end)
            </label>
            <input
              type="number"
              id="threshold-minutes"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="mt-6 text-center bg-indigo-100 p-3 rounded-lg">
             <span className="block text-3xl font-bold text-indigo-700">{eligibleCount}</span>
             <span className="block text-sm font-medium text-indigo-600">Eligible</span>
          </div>
        </div>
        
        {/* Send Certificates Button */}
        <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {pendingCount > 0 ? (
                <>
                  <span className="text-2xl font-bold text-blue-600">{pendingCount}</span>
                  <span className="text-gray-700"> participant{pendingCount !== 1 ? 's' : ''} pending certificate delivery</span>
                </>
              ) : (
                <span className="text-green-600">✓ All eligible participants have received certificates</span>
              )}
            </p>
          </div>
          <button
            onClick={onSendCertificates}
            disabled={certificatesSending || pendingCount === 0}
            className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition duration-200 ${
              certificatesSending || pendingCount === 0
                ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            <Award className="h-5 w-5 mr-2" />
            {certificatesSending ? 'Sending...' : 'Send Certificates'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Certificate List Component ---
export const CertificateList = ({ eligiblePeople, onGenerateCertificate }) => {
  if (eligiblePeople.length === 0) {
    return (
      <div className="mt-8 p-4 text-center bg-gray-50 border-2 border-gray-200 border-dashed rounded-lg">
        <p className="text-gray-500">No participants are eligible for a certificate based on the current threshold.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Generate Certificates ({eligiblePeople.length} Eligible)
      </h3>
      <div className="max-h-80 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        {eligiblePeople.map((person) => (
          <div key={person.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <span className="font-medium text-gray-800 mb-1 sm:mb-0">{person.name}</span>
            <button
              onClick={() => onGenerateCertificate(person)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
            >
              <Award className="h-5 w-5 mr-2" />
              Generate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
