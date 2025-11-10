'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { fetchData, updateData } from '@/utils/api';
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import specialistSpecialties from '@/utils/specialistSpecialties';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getData } from 'country-list';

const formInput =
  "border-[3px] border-primary-5 text-primary-2 rounded-[20px] overflow-hidden p-2 w-full";

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    DOB: '',
    phone: '',
    address: { street: '', city: '', state: '', country: '' },
    specialty: 'General Practitioner',
    category: 'General Practitioner',
    licenseNumber: '',
    experience: '',
    languages: '',
    bio: '',
    bankDetails: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      sortCode: '',
      iban: '',
      swiftBic: ''
    }
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImageFileName, setProfileImageFileName] = useState('');
  const [role, setRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [practicingLicenseFile, setPracticingLicenseFile] = useState(null);
  const [practicingLicenseFileName, setPracticingLicenseFileName] = useState('');

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, 'success');
  const alertError = (msg) => addToast(msg, 'error');

  useEffect(() => {
    const fetchUser = async () => {
      if (!email) return setError('Email is required to complete profile');

      try {
        const user = await fetchData(`users/get/by-email?email=${email}`);
        if (!user) throw new Error(user.message || 'Failed to fetch user');

        setFormData((prev) => ({
          ...prev,
          ...user,
          specialty: 'General Practitioner',
          category: 'General Practitioner',
          address: {
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            country: user.address?.country || '',
          },
        }));

        setRole(user.role);
      } catch (err) {
        setError(err.message || 'Error loading user');
      }
    };

    fetchUser();
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else if (name.includes('bankDetails.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileImageFile(file);
    setProfileImageFileName(file ? file.name : '');
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (role === 'specialist') {
      if (!formData.licenseNumber || !formData.specialty || !profileImageFile || !practicingLicenseFile) {
        setError("Please complete all specialist fields.");
        setSubmitting(false);
        return;
      }
    }

    const payload = new FormData();
    // Ensure specialty and category are always 'General Practitioner'
    const dataToSend = {
      ...formData,
      specialty: 'General Practitioner',
      category: 'General Practitioner',
    };
    for (const key in dataToSend) {
      if (key !== 'address' && key !== 'bankDetails') payload.append(key, dataToSend[key]);
    }
    for (const key in formData.address) {
      payload.append(`address.${key}`, formData.address[key]);
    }
    for (const key in formData.bankDetails) {
      payload.append(`bankDetails.${key}`, formData.bankDetails[key]);
    }
    if (profileImageFile) payload.append('profileImage', profileImageFile);
    if (practicingLicenseFile) payload.append('practicingLicense', practicingLicenseFile);

    try {
      const res = await updateData(`users/complete/profile?email=${email}`, payload, token, true);
      if (!res || res.status > 201) {
        const friendlyMessage = res?.message || 'We couldn’t update your profile at the moment.';
        alertError(friendlyMessage);
        setError(friendlyMessage);
      } else {
        alertSuccess('Profile updated successfully!');
        // Refresh NextAuth session so middleware sees isProfileComplete=true
        try {
          const loginRes = await signIn('credentials', {
            redirect: false,
            email,
            token: token,
            callbackUrl: '/admin',
          });

          if (loginRes?.error) {
            // Fallback redirect; middleware may still block if session not updated
            window.location.href = "/admin";
          } else if (loginRes?.url) {
            window.location.href = loginRes.url;
          } else {
            window.location.href = "/admin";
          }
        } catch (e) {
          window.location.href = "/admin";
        }
      }
    } catch (err) {
      alertError("Profile update failed.");
      setError("Something went wrong while updating your profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const countries = getData();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl overflow-hidden grid md:grid-cols-2">
        {/* Left: Image or branding */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[var(--color-primary-7)] p-6 text-white">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">
              {session?.user?.name ? `Welcome, ${session.user.name}!` : 'Welcome!'}
            </h2>
            <p className="text-lg">Complete your profile to get started.</p>
          </div>

          {/* Complete Later removed to enforce mandatory completion */}
        </div>


        {/* Right: Form */}
        <div className="p-8">
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">Complete Your Profile</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-gray-600">First Name <span className='text-red-700'>*</span></label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputStyle} required />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Last Name <span className='text-red-700'>*</span></label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputStyle} required />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Date of Birth <span className='text-red-700'>*</span></label>
                <input type="date" name="DOB" value={formData.DOB} onChange={handleChange} className={inputStyle} required />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Phone <span className='text-red-700'>*</span></label>
                <PhoneInput
                  country={'ng'}               // Change 'ng' to your preferred default country code
                  value={formData.phone}
                  onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                  countryCodeEditable={false}  // disables editing the country code prefix
                  inputStyle={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '20px',
                    border: '2px solid rgba(38, 51, 71, 0.11)',
                  }}
                  buttonStyle={{
                    borderRadius: '20px 0 0 20px',
                    border: '2px solid rgba(38, 51, 71, 0.11)',
                  }}
                  inputProps={{
                    name: 'phone',
                    required: true,
                  }}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Street</label>
                <input name="address.street" value={formData.address.street} onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">City</label>
                <input name="address.city" value={formData.address.city} onChange={handleChange} className={inputStyle} />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">State</label>
                <input name="address.state" value={formData.address.state} onChange={handleChange} className={inputStyle} />
              </div>
              <div className="col-span-full">
                <label className="block mb-1 text-sm text-gray-600">Country</label>
                <select
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(({ code, name }) => (
                    <option key={code} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {role === 'specialist' && (
              <>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">License Number <span className='text-red-700'>*</span></label>
                  <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className={inputStyle} required />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Upload Practicing License <span className='text-red-700'>*</span></label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="practicingLicenseInput"
                      accept="application/pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setPracticingLicenseFile(file);
                        setPracticingLicenseFileName(file ? file.name : '');
                      }}
                      className="hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('practicingLicenseInput').click()}
                      className="px-4 py-2 bg-[var(--color-primary-7)] text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Choose File
                    </button>
                    {practicingLicenseFileName && (
                      <span className="text-sm text-gray-600 truncate max-w-xs">{practicingLicenseFileName}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Short Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full p-2 border-2 rounded focus:outline-none focus:ring focus:border-blue-400 text-sm" rows={4} />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Years of Experience</label>
                  <input name="experience" value={formData.experience} onChange={handleChange} type="number" min="0" className={inputStyle} />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Languages Spoken</label>
                  <input name="languages" value={formData.languages} onChange={handleChange} className={inputStyle} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Bank Name <span className='text-red-700'>*</span></label>
                    <input name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} className={inputStyle} required />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Account Name <span className='text-red-700'>*</span></label>
                    <input name="bankDetails.accountName" value={formData.bankDetails.accountName} onChange={handleChange} className={inputStyle} required />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Account Number <span className='text-red-700'>*</span></label>
                    <input name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} className={inputStyle} required />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Sort Code</label>
                    <input name="bankDetails.sortCode" value={formData.bankDetails.sortCode} onChange={handleChange} className={inputStyle} />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">IBAN</label>
                    <input name="bankDetails.iban" value={formData.bankDetails.iban} onChange={handleChange} className={inputStyle} />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">SWIFT/BIC</label>
                    <input name="bankDetails.swiftBic" value={formData.bankDetails.swiftBic} onChange={handleChange} className={inputStyle} />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">Profile Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="profileImageInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('profileImageInput').click()}
                  className="px-4 py-2 bg-[var(--color-primary-7)] text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Choose File
                </button>
                {profileImageFileName && (
                  <span className="text-sm text-gray-600 truncate max-w-xs">{profileImageFileName}</span>
                )}
              </div>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-24 rounded-full object-cover shadow" />
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
                submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-[var(--color-primary-7)] hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Saving...' : 'Save & Continue'}
            </button>

            {/* Complete Later removed to enforce mandatory completion */}

          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = "w-full p-2 border-2 rounded-full focus:outline-none focus:ring focus:border-blue-400 text-sm";

