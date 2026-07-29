import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { t, language, paperSize, changeLanguage, changePaperSize } = useSettings();

  const handleLangChange = (lang) => {
    changeLanguage(lang);
    toast.success(t.settingsSaved);
  };

  const handlePaperChange = (size) => {
    changePaperSize(size);
    toast.success(t.settingsSaved);
  };

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '300px' }}>
            {[
              { value: 'a4', label: t.paperA4 },
              { value: 'a5', label: t.paperA5 },
              { value: 'thermal80', label: t.paperThermal80 },
              { value: 'thermal58', label: t.paperThermal58 },
            ].map((option) => (
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
                  onChange={() => handlePaperChange(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
