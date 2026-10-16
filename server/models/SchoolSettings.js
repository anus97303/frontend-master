import mongoose from 'mongoose';

const schoolSettingsSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      default: 'Springfield International Academy',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Empowering Minds, Shaping the Future',
      trim: true,
    },
    schoolEmail: {
      type: String,
      default: 'contact@springfieldacademy.edu',
      trim: true,
    },
    schoolPhone: {
      type: String,
      default: '+1 (555) 234-5678',
      trim: true,
    },
    address: {
      type: String,
      default: '742 Evergreen Terrace, Springfield, OR 97477',
      trim: true,
    },
    principalName: {
      type: String,
      default: 'Dr. Seymour Skinner',
      trim: true,
    },
    currentAcademicYear: {
      type: String,
      default: '2025-2026',
      trim: true,
    },
    currencySymbol: {
      type: String,
      default: '$',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: 'https://springfieldacademy.edu',
      trim: true,
    },
    establishedYear: {
      type: Number,
      default: 1995,
    },
  },
  {
    timestamps: true,
  }
);

const SchoolSettings = mongoose.model('SchoolSettings', schoolSettingsSchema);
export default SchoolSettings;
