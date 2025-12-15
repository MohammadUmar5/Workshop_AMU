import React, { useState, useRef } from 'react';
import { colors } from '../theme/colors';

const PassCustomizationPanel = ({ 
  currentConfig = {},
  onSave,
  onCancel
}) => {
  const safeConfig = currentConfig || {};
  
  const [config, setConfig] = useState({
    bgColor: safeConfig.bgColor || '#eff6ff',
    borderColor: safeConfig.borderColor || '#60a5fa',
    titleColor: safeConfig.titleColor || '#1e3a8a',
    subtitleColor: safeConfig.subtitleColor || '#1d4ed8',
    textColor: safeConfig.textColor || '#1f2937',
    highlightBgColor: safeConfig.highlightBgColor || '#ffffff',
    accentColor: safeConfig.accentColor || '#4f46e5',
    showLogos: safeConfig.showLogos !== undefined ? safeConfig.showLogos : true,
    borderWidth: safeConfig.borderWidth || '2px',
  });

  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef(null);

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      if (!window.htmlToImage) {
        throw new Error('html-to-image library not loaded');
      }

      const element = previewRef.current;
      if (!element) {
        throw new Error('Preview element not found');
      }

      const blob = await window.htmlToImage.toBlob(element, {
        quality: 1.0,
        pixelRatio: 2,
      });

      const formData = new FormData();
      formData.append('template', blob, 'pass-template.png');
      formData.append('config', JSON.stringify(config));

      const response = await fetch('/api/templates/pass', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      const result = await response.json();
      onSave?.(config, result.templatePath);
    } catch (error) {
      console.error('Error saving pass template:', error);
      alert('Failed to save pass template: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>
            Customize Pass Template
          </h2>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Customize your pass design and preview changes in real-time
          </p>
        </div>

        <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: colors.background.tertiary, border: `1px solid ${colors.border.default}` }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>Color Scheme</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Background Color</label>
              <input type="color" value={config.bgColor} onChange={(e) => handleInputChange('bgColor', e.target.value)} className="w-full h-10 rounded cursor-pointer" style={{ border: `1px solid ${colors.border.default}` }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Border Color</label>
              <input type="color" value={config.borderColor} onChange={(e) => handleInputChange('borderColor', e.target.value)} className="w-full h-10 rounded cursor-pointer" style={{ border: `1px solid ${colors.border.default}` }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Name Color</label>
              <input type="color" value={config.titleColor} onChange={(e) => handleInputChange('titleColor', e.target.value)} className="w-full h-10 rounded cursor-pointer" style={{ border: `1px solid ${colors.border.default}` }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Subtitle Color</label>
              <input type="color" value={config.subtitleColor} onChange={(e) => handleInputChange('subtitleColor', e.target.value)} className="w-full h-10 rounded cursor-pointer" style={{ border: `1px solid ${colors.border.default}` }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Text Color</label>
              <input type="color" value={config.textColor} onChange={(e) => handleInputChange('textColor', e.target.value)} className="w-full h-10 rounded cursor-pointer" style={{ border: `1px solid ${colors.border.default}` }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Refreshment Box Background</label>
              <input type="color" value={config.highlightBgColor} onChange={(e) => handleInputChange('highlightBgColor', e.target.value)} className="w-full h-10 rounded cursor-pointer" style={{ border: `1px solid ${colors.border.default}` }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Refreshment Box Text Color</label>
              <input type="color" value={config.accentColor} onChange={(e) => handleInputChange('accentColor', e.target.value)} className="w-full h-10 rounded cursor-pointer" style={{ border: `1px solid ${colors.border.default}` }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: colors.background.tertiary, border: `1px solid ${colors.border.default}` }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>Border & Options</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Border Width: {config.borderWidth}</label>
              <input type="range" min="0" max="6" step="1" value={parseInt(config.borderWidth)} onChange={(e) => handleInputChange('borderWidth', e.target.value + 'px')} className="w-full" style={{ accentColor: colors.accent.blurple }} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="showLogos" checked={config.showLogos} onChange={(e) => handleInputChange('showLogos', e.target.checked)} className="w-5 h-5 rounded cursor-pointer" style={{ accentColor: colors.accent.blurple }} />
              <label htmlFor="showLogos" className="text-sm font-medium cursor-pointer" style={{ color: colors.text.secondary }}>Show Organization Logos</label>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: colors.background.tertiary, border: `1px solid ${colors.border.default}` }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>Live Preview</h3>
          <div className="flex justify-center overflow-auto">
            <div className="transform scale-75 origin-top">
              <PassPreview config={config} ref={previewRef} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded text-sm font-medium transition-colors" style={{ backgroundColor: colors.background.tertiary, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.background.hover; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.background.tertiary; }}>
            Cancel
          </button>
          <button onClick={handleSaveTemplate} disabled={isSaving} className="px-4 py-2 rounded text-sm font-medium transition-colors" style={{ backgroundColor: colors.status.success, color: '#ffffff', opacity: isSaving ? 0.6 : 1 }}>
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PassPreview = React.forwardRef(({ config }, ref) => {
  return (
    <div ref={ref} style={{ width: '800px', padding: '24px', backgroundColor: config.bgColor, border: `${config.borderWidth} solid ${config.borderColor}`, borderRadius: '8px', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '16px', borderBottom: `2px solid ${config.borderColor}`, marginBottom: '20px' }}>
        <svg style={{ width: '40px', height: '40px', color: config.subtitleColor, marginRight: '16px', flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: config.titleColor, marginBottom: '4px' }}>[Participant Name]</div>
          <div style={{ fontSize: '18px', fontWeight: '500', color: config.subtitleColor }}>Has Been Admitted</div>
        </div>
      </div>
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: config.highlightBgColor, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Refreshment Preference</div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '24px', fontWeight: 'bold', color: config.accentColor }}><span style={{ marginRight: '12px' }}>☕</span><span>[Diet Preference]</span></div>
      </div>
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', color: config.textColor, fontSize: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ marginRight: '12px', fontSize: '20px' }}>🏢</span><strong>[Department]</strong></div>
        <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ marginRight: '12px', fontSize: '20px' }}>📚</span><span>Year: <b>[Year]</b></span></div>
        <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ marginRight: '12px', fontSize: '20px' }}>📞</span><span>[Phone]</span></div>
        <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ marginRight: '12px', fontSize: '20px' }}>✉️</span><span>[Email]</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gridColumn: '1 / -1' }}><span style={{ marginRight: '12px', fontSize: '20px' }}>🕐</span><span>Admitted at: <b>[Time]</b></span></div>
      </div>
      {config.showLogos && (
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `2px solid ${config.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="https://upload.wikimedia.org/wikipedia/en/7/7c/Logo-aps-no-tagline.svg" alt="APS Logo" style={{ height: '36px', width: 'auto' }} />
          <img src="https://olympiaacademia.github.io/images/logo.png" alt="Olympia Academia Logo" style={{ height: '40px', width: 'auto' }} />
        </div>
      )}
    </div>
  );
});

PassPreview.displayName = 'PassPreview';

export default PassCustomizationPanel;
