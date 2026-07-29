import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { t, language, paperSize, customSize, changeLanguage, changePaperSize, changeCustomSize } = useSettings();
  const [customForm, setCustomForm] = useState(customSize);

  const handleLangChange = (lang) => {
    changeLanguage(lang);
    toast.success(t.settingsSaved);
  };

  const handlePaperChange = (size) => {
    changePaperSize(size);
    toast.success(t.settingsSaved);
  };

  const handleCustomSave = () => {
    if (!customForm.width || !customForm.height) return toast.error('Width and height are required');
    changeCustomSize(customForm);
    changePaperSize('custom');
    toast.success(t.settingsSaved);
  };

  const paperOptions = [
    { value: 'a4', label: t.paperA4 },
    { value: 'a5', label: t.paperA5 },
    { value: 'thermal80', label: t.paperThermal80 },
    { value: 'thermal58', label: t.paperThermal58 },
    { value: 'custom', label: t.customSize || 'Custom Size' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>{t.settings}</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{t.generalSettings}</h3>
        <div className="form-group">
          <label>{t.language}</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className={language === 'en' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => handleLangChange('en')}
            >
              {t.english}
            </button>
            <button
              className={language === 'ar' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => handleLangChange('ar')}
            >
              {t.arabic}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>{t.billSettings}</h3>
        <div className="form-group">
          <label>{t.billPaperSize}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '350px' }}>
            {paperOptions.map((option) => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  border: `2px solid ${paperSize === option.value ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  background: paperSize === option.value ? '#eef2ff' : 'white',
                }}
              >
                <input
                  type="radio"
                  name="paperSize"
                  value={option.value}
                  checked={paperSize === option.value}
                  onChange={() => option.value !== 'custom' ? handlePaperChange(option.value) : changePaperSize('custom')}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Custom size inputs */}
        {paperSize === 'custom' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius)', maxWidth: '350px' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t.customSize || 'Custom Size'}</h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>{t.width || 'Width'}</label>
                <input
                  type="number"
                  value={customForm.width}
                  onChange={(e) => setCustomForm({ ...customForm, width: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>{t.height || 'Height'}</label>
                <input
                  type="number"
                  value={customForm.height}
                  onChange={(e) => setCustomForm({ ...customForm, height: e.target.value })}
                  placeholder="150"
                />
              </div>
              <div className="form-group" style={{ flex: 0.7, marginBottom: 0 }}>
                <label>{t.unit || 'Unit'}</label>
                <select
                  value={customForm.unit}
                  onChange={(e) => setCustomForm({ ...customForm, unit: e.target.value })}
                >
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" style={{ marginTop: '0.75rem' }} onClick={handleCustomSave}>
              {t.save}
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
              {t.currentSize || 'Current'}: {customSize.width}{customSize.unit} × {customSize.height}{customSize.unit}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
