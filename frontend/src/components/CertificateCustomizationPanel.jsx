import React, { useState, useRef } from 'react';
import { colors } from '../theme/colors';

/**
 * CertificateCustomizationPanel Component
 * 
 * Inline panel for customizing certificate design with live preview (vertical layout)
 * Replaces the modal version with an inline main panel component
 * 
 * Props:
 * @param {object} currentConfig - Current certificate configuration
 * @param {function} onSave - Save template callback
 * @param {function} onCancel - Cancel/close callback
 */

const CertificateCustomizationPanel = ({ 
  currentConfig = {},
  onSave,
  onCancel
}) => {
  // Safely handle null currentConfig
  const safeConfig = currentConfig || {};
  
  const [config, setConfig] = useState({
    title: safeConfig.title || 'Certificate of Participation',
    body: safeConfig.body || 'for successfully participating in our workshop and demonstrating dedication to learning and growth.',
    nameFont: safeConfig.nameFont || 'cursive',
    titleFont: safeConfig.titleFont || 'elegant-serif',
    sigFont: safeConfig.sigFont || 'cursive',
    signature: safeConfig.signature || 'Muneeb Basu',
    sigTitle1: safeConfig.sigTitle1 || 'PRESIDENT, OLYMPIA ACADEMIA, AMU',
    sigTitle2: safeConfig.sigTitle2 || 'STUDENT AMBASSADOR, APS',
    bgColor: safeConfig.bgColor || '#ffffff',
    borderStyle: safeConfig.borderStyle || 'elegant',
    titleColor: safeConfig.titleColor || '#4338ca',
    textColor: safeConfig.textColor || '#374151',
  });

  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef(null);

  const fontOptions = [
    { value: 'cursive', label: 'Great Vibes (Cursive)' },
    { value: 'handwriting', label: 'Dancing Script' },
    { value: 'script-pacifico', label: 'Pacifico' },
    { value: 'script-tangerine', label: 'Tangerine' },
    { value: 'handwriting-caveat', label: 'Caveat' },
    { value: 'casual-patrick', label: 'Patrick Hand' },
    { value: 'elegant-serif', label: 'Playfair Display' },
    { value: 'serif', label: 'Merriweather' },
    { value: 'serif-lora', label: 'Lora' },
    { value: 'sans', label: 'Inter' },
    { value: 'sans-montserrat', label: 'Montserrat' },
  ];

  const borderStyles = [
    { value: 'elegant', label: 'Elegant Border' },
    { value: 'simple', label: 'Simple Border' },
    { value: 'ornate', label: 'Ornate Border' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'none', label: 'No Border' },
  ];

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      // Use html-to-image to generate certificate template
      if (!window.htmlToImage) {
        throw new Error('html-to-image library not loaded');
      }

      const element = previewRef.current;
      if (!element) {
        throw new Error('Preview element not found');
      }

      // Generate image blob
      const blob = await window.htmlToImage.toBlob(element, {
        quality: 1.0,
        pixelRatio: 2,
      });

      // Save to backend/templates/ via API
      const formData = new FormData();
      formData.append('template', blob, 'certificate-template.png');
      formData.append('config', JSON.stringify(config));

      const response = await fetch('/api/templates/certificate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      const result = await response.json();
      
      // Call onSave callback with config
      onSave?.(config, result.templatePath);
    } catch (error) {
      console.error('Error saving certificate template:', error);
      alert('Failed to save certificate template: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text.primary }}
          >
            Customize Certificate Template
          </h2>
          <p 
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            Customize your certificate design and preview changes in real-time
          </p>
        </div>

        {/* Controls Section */}
        <div 
          className="rounded-lg p-6 mb-6"
          style={{ 
            backgroundColor: colors.background.tertiary,
            border: `1px solid ${colors.border.default}`
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: colors.text.primary }}
          >
            Certificate Content
          </h3>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Certificate Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: colors.background.input,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.default}`,
                }}
              />
            </div>

            {/* Body Text */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Body Text
              </label>
              <textarea
                value={config.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: colors.background.input,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.default}`,
                }}
              />
            </div>

            {/* Signature */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Signature Name
              </label>
              <input
                type="text"
                value={config.signature}
                onChange={(e) => handleInputChange('signature', e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: colors.background.input,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.default}`,
                }}
              />
            </div>

            {/* Signature Title 1 */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Signature Title Line 1
              </label>
              <input
                type="text"
                value={config.sigTitle1}
                onChange={(e) => handleInputChange('sigTitle1', e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: colors.background.input,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.default}`,
                }}
              />
            </div>

            {/* Signature Title 2 */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Signature Title Line 2
              </label>
              <input
                type="text"
                value={config.sigTitle2}
                onChange={(e) => handleInputChange('sigTitle2', e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: colors.background.input,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.default}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Styling Section */}
        <div 
          className="rounded-lg p-6 mb-6"
          style={{ 
            backgroundColor: colors.background.tertiary,
            border: `1px solid ${colors.border.default}`
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: colors.text.primary }}
          >
            Typography & Style
          </h3>
          
          <div className="space-y-4">
            {/* Title Font */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Title Font
              </label>
              <select
                value={config.titleFont}
                onChange={(e) => handleInputChange('titleFont', e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: colors.background.input,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                {fontOptions.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>

            {/* Name Font */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Name Font (Dynamic)
              </label>
              <select
                value={config.nameFont}
                onChange={(e) => handleInputChange('nameFont', e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: colors.background.input,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                {fontOptions.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>

            {/* Signature Font */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Signature Font
              </label>
              <select
                value={config.sigFont}
                onChange={(e) => handleInputChange('sigFont', e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: colors.background.input,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                {fontOptions.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>

            {/* Border Style */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.secondary }}
              >
                Border Style
              </label>
              <select
                value={config.borderStyle}
                onChange={(e) => handleInputChange('borderStyle', e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: colors.background.input,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                {borderStyles.map(border => (
                  <option key={border.value} value={border.value}>{border.label}</option>
                ))}
              </select>
            </div>

            {/* Colors Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Background Color */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  Background
                </label>
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => handleInputChange('bgColor', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                  style={{
                    border: `1px solid ${colors.border.default}`,
                  }}
                />
              </div>

              {/* Title Color */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  Title Color
                </label>
                <input
                  type="color"
                  value={config.titleColor}
                  onChange={(e) => handleInputChange('titleColor', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                  style={{
                    border: `1px solid ${colors.border.default}`,
                  }}
                />
              </div>

              {/* Text Color */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  Text Color
                </label>
                <input
                  type="color"
                  value={config.textColor}
                  onChange={(e) => handleInputChange('textColor', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                  style={{
                    border: `1px solid ${colors.border.default}`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Section */}
        <div 
          className="rounded-lg p-6 mb-6"
          style={{ 
            backgroundColor: colors.background.tertiary,
            border: `1px solid ${colors.border.default}`
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: colors.text.primary }}
          >
            Live Preview
          </h3>
          
          <div className="flex justify-center overflow-auto">
            <div className="transform scale-50 origin-top">
              <CertificatePreview config={config} ref={previewRef} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: colors.background.tertiary,
              color: colors.text.secondary,
              border: `1px solid ${colors.border.default}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.background.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.background.tertiary;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: colors.status.success,
              color: '#ffffff',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Certificate Preview Component
const CertificatePreview = React.forwardRef(({ config }, ref) => {
  const getFontFamily = (fontValue) => {
    const fontMap = {
      'cursive': 'Great Vibes',
      'handwriting': 'Dancing Script',
      'script-pacifico': 'Pacifico',
      'script-tangerine': 'Tangerine',
      'handwriting-caveat': 'Caveat',
      'casual-patrick': 'Patrick Hand',
      'elegant-serif': 'Playfair Display',
      'serif': 'Merriweather',
      'serif-lora': 'Lora',
      'sans': 'Inter',
      'sans-montserrat': 'Montserrat',
    };
    return fontMap[fontValue] || 'Inter';
  };

  const getBorderStyle = () => {
    switch (config.borderStyle) {
      case 'elegant':
        return '8px double #4338ca';
      case 'simple':
        return '4px solid #4338ca';
      case 'ornate':
        return '6px ridge #d4af37';
      case 'minimal':
        return '2px solid #6b7280';
      case 'none':
        return 'none';
      default:
        return '4px solid #4338ca';
    }
  };

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        width: '1200px',
        height: '900px',
        backgroundColor: config.bgColor,
        border: getBorderStyle(),
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Title */}
      <div className="text-center">
        <h1
          style={{
            fontFamily: getFontFamily(config.titleFont),
            fontSize: '48px',
            fontWeight: 'bold',
            color: config.titleColor,
            marginBottom: '20px',
          }}
        >
          {config.title}
        </h1>
        <p
          style={{
            fontFamily: 'Merriweather, serif',
            fontSize: '20px',
            color: '#6b7280',
          }}
        >
          This certificate is proudly presented to
        </p>
      </div>

      {/* Name Placeholder */}
      <div className="text-center">
        <p
          style={{
            fontFamily: getFontFamily(config.nameFont),
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '40px',
          }}
        >
          [PARTICIPANT NAME]
        </p>

        {/* Body Text */}
        <p
          style={{
            fontFamily: 'Merriweather, serif',
            fontSize: '20px',
            color: config.textColor,
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          {config.body}
        </p>
      </div>

      {/* Signature */}
      <div className="text-center">
        <div
          style={{
            borderTop: '1px solid #374151',
            width: '400px',
            margin: '0 auto 10px',
          }}
        />
        <p
          style={{
            fontFamily: getFontFamily(config.sigFont),
            fontSize: '32px',
            fontWeight: '500',
            color: '#1f2937',
            marginBottom: '5px',
          }}
        >
          {config.signature}
        </p>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#6b7280',
            letterSpacing: '0.1em',
            marginBottom: '3px',
          }}
        >
          {config.sigTitle1}
        </p>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#6b7280',
            letterSpacing: '0.1em',
          }}
        >
          {config.sigTitle2}
        </p>
      </div>

      {/* Load Google Fonts */}
      <link
        href={`https://fonts.googleapis.com/css2?family=${getFontFamily(config.nameFont).replace(/ /g, '+')}:wght@700&family=${getFontFamily(config.titleFont).replace(/ /g, '+')}:wght@700&family=${getFontFamily(config.sigFont).replace(/ /g, '+')}:wght@500&family=Merriweather:wght@400&family=Inter:wght@400&display=swap`}
        rel="stylesheet"
      />
    </div>
  );
});

CertificatePreview.displayName = 'CertificatePreview';

export default CertificateCustomizationPanel;
