import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSchool, type SchoolSettings as SchoolSettingsType } from '@/context/SchoolContext';
import { CheckCircleIcon } from '@/icons';

export default function SchoolSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { settings, updateSettings } = useSchool();

  const [formData, setFormData] = useState<SchoolSettingsType>(settings);
  const [campusesInput, setCampusesInput] = useState<string>(settings.campuses.join(', '));
  const [systemsInput, setSystemsInput] = useState<string>(settings.systems.join(', '));

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    setFormData(settings);
    setCampusesInput(settings.campuses.join(', '));
    setSystemsInput(settings.systems.join(', '));
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      const parsedCampuses = campusesInput.split(',').map((c) => c.trim()).filter(Boolean);
      const parsedSystems = systemsInput.split(',').map((s) => s.trim()).filter(Boolean);

      const updatedPayload: Partial<SchoolSettingsType> = {
        ...formData,
        campuses: parsedCampuses.length > 0 ? parsedCampuses : settings.campuses,
        systems: parsedSystems.length > 0 ? parsedSystems : settings.systems,
      };

      await updateSettings(updatedPayload);
      setSuccessMsg('School details and system branding successfully updated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const canManage = user?.role === 'admin' || !user;

  return (
    <>
      <PageMeta
        title={`Settings | ${settings.schoolName}`}
        description="Configure institution profile, academic sessions, campuses, and localized preferences"
      />
      <PageBreadcrumb pageTitle={t('school.settings', 'School Settings & Branding')} />

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 text-sm font-semibold text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400">
          <CheckCircleIcon className="size-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Settings Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white/90">
                School Identity & Campus Configuration
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customize institution name, short acronym, active campus, and academic session.
              </p>
            </div>
            <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              Active: {settings.shortName}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="schoolName">School / Institute Name *</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  disabled={!canManage}
                  placeholder="e.g. My School Management System"
                  required
                />
              </div>
              <div>
                <Label htmlFor="shortName">Short Acronym / Code</Label>
                <Input
                  id="shortName"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleChange}
                  disabled={!canManage}
                  placeholder="e.g. IVEM / SMS"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tagline">School Motto / Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                disabled={!canManage}
                placeholder="e.g. Next-Generation Campus & School ERP"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="currentCampus">Active Default Campus</Label>
                <select
                  id="currentCampus"
                  name="currentCampus"
                  value={formData.currentCampus}
                  onChange={handleChange}
                  disabled={!canManage}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {settings.campuses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="currentAcademicYear">Current Academic Session</Label>
                <Input
                  id="currentAcademicYear"
                  name="currentAcademicYear"
                  value={formData.currentAcademicYear}
                  onChange={handleChange}
                  disabled={!canManage}
                  placeholder="2024-2025"
                  required
                />
              </div>
            </div>

            {/* Campuses & Systems */}
            <div>
              <Label htmlFor="campuses">Configured Campuses (comma-separated)</Label>
              <Input
                id="campuses"
                name="campuses"
                value={campusesInput}
                onChange={(e) => setCampusesInput(e.target.value)}
                disabled={!canManage}
                placeholder="Main Campus, City Campus, North Campus, Junior Wing"
              />
              <span className="mt-1 block text-theme-xs text-gray-400">
                These campuses appear in filters across Registration, Fee Collection, and Attendance.
              </span>
            </div>

            <div>
              <Label htmlFor="systems">Educational Systems (comma-separated)</Label>
              <Input
                id="systems"
                name="systems"
                value={systemsInput}
                onChange={(e) => setSystemsInput(e.target.value)}
                disabled={!canManage}
                placeholder="Matric, Cambridge (O/A Levels), Federal Board, Oxford Syllabus"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="schoolEmail">Official Contact Email *</Label>
                <Input
                  id="schoolEmail"
                  name="schoolEmail"
                  type="email"
                  value={formData.schoolEmail}
                  onChange={handleChange}
                  disabled={!canManage}
                  required
                />
              </div>
              <div>
                <Label htmlFor="schoolPhone">Official Phone Number *</Label>
                <Input
                  id="schoolPhone"
                  name="schoolPhone"
                  value={formData.schoolPhone}
                  onChange={handleChange}
                  disabled={!canManage}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="principalName">Principal / Dean Name</Label>
                <Input
                  id="principalName"
                  name="principalName"
                  value={formData.principalName}
                  onChange={handleChange}
                  disabled={!canManage}
                />
              </div>
              <div>
                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                <Input
                  id="currencySymbol"
                  name="currencySymbol"
                  value={formData.currencySymbol}
                  onChange={handleChange}
                  disabled={!canManage}
                  placeholder="Rs. or $"
                />
              </div>
              <div>
                <Label htmlFor="city">City & Country</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!canManage}
                  placeholder="Islamabad, Pakistan"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Full Campus Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!canManage}
              />
            </div>

            {canManage && (
              <div className="flex justify-end pt-4">
                <Button type="submit" size="sm" disabled={isSaving}>
                  {isSaving ? 'Updating...' : 'Save School Changes'}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Side Panel: Language & Grading Info */}
        <div className="space-y-6">
          {/* Language Switcher Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-base font-bold text-gray-800 dark:text-white/90">
              Interface Language (i18n)
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Switch language. Arabic and Urdu RTL layouts are supported.
            </p>

            <div className="space-y-2">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-sm font-medium transition ${
                    language === lang.code
                      ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{lang.name}</span>
                  <span className="text-xs uppercase text-gray-400">
                    {lang.code} • {lang.dir}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Standard Grading System Rules */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-base font-bold text-gray-800 dark:text-white/90">
              Official Grading Scale
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Automated letter grades based on percentage:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                <span className="font-bold text-success-600">A+ (Distinction)</span>
                <span>≥ 90%</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                <span className="font-bold text-success-600">A (Excellent)</span>
                <span>≥ 80%</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                <span className="font-bold text-brand-600">B (Very Good)</span>
                <span>≥ 70%</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                <span className="font-bold text-warning-600">C (Satisfactory)</span>
                <span>≥ 60%</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                <span className="font-bold text-warning-600">D (Pass)</span>
                <span>≥ 50%</span>
              </div>
              <div className="flex justify-between rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                <span className="font-bold text-error-600">F (Fail)</span>
                <span>&lt; 50%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
