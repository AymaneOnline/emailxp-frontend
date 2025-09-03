import React, { useState, useEffect } from 'react';

// This is a self-contained component and simulates external dependencies.
// In a real application, you would be using useNavigate, useSelector, useDispatch, and your userService.
// We'll use a local state and console logs to simulate that behavior.

const UserProfileForm = () => {
  // Simulate the user state from Redux
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    isProfileComplete: false,
    companyOrOrganization: '',
    phoneNumber: '',
    address: '',
    website: '',
    profilePicture: null,
  });

  const [formData, setFormData] = useState({
    companyOrOrganization: '',
    phoneNumber: '',
    address: '',
    website: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [profilePicture, setProfilePicture] = useState(null);

  // A local function to simulate `useNavigate`
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would be navigate(path) from react-router-dom
  };

  // Simulate fetching profile data from an API
  useEffect(() => {
    setLoading(true);
    // Simulate a successful API call after 1 second
    setTimeout(() => {
      setFormData({
        companyOrOrganization: user.companyOrOrganization,
        phoneNumber: user.phoneNumber,
        address: user.address,
        website: user.website,
      });
      setProfilePicture(user.profilePicture);
      setLoading(false);
    }, 1000);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Simulate API call to update profile
    setTimeout(() => {
      const { companyOrOrganization } = formData;
      const isProfileNowComplete = companyOrOrganization && user.name && user.email;

      const updatedUser = {
        ...user,
        ...formData,
        profilePicture: profilePicture,
        isProfileComplete: isProfileNowComplete && !user.isProfileComplete ? true : user.isProfileComplete,
      };

      setUser(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      setLoading(false);

      if (isProfileNowComplete && !user.isProfileComplete) {
        navigate('/app/dashboard');
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        {/* Spinner Icon */}
        <svg className="h-16 w-16 text-primary-red animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg text-dark-gray">Loading profile data...</p>
      </div>
    );
  }

  const isProfileIncomplete = !user.isProfileComplete;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full max-w-2xl mx-auto my-8">
        <h1 className="text-3xl font-bold text-dark-gray mb-8">Profile Settings</h1>

        {/* Error and Success Messages */}
        {error && (
          <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
            {/* XCircle Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
            {/* CheckCircle Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300">
              {profilePicture ? (
                <img
                  src={URL.createObjectURL(profilePicture)}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500 w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4M4 16h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2zM12 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <label htmlFor="profilePicture" className="cursor-pointer bg-primary-red text-white font-semibold py-2 px-4 rounded-full shadow-md hover:bg-custom-red-hover transition duration-300 ease-in-out">
              Upload Profile Picture
            </label>
            <input
              id="profilePicture"
              name="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Read-only Name and Email fields from registration */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  value={user.name}
                  className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm p-2.5"
                  disabled
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm p-2.5"
                  disabled
                />
              </div>
            </div>

            {/* Editable fields */}
            <div>
              <label htmlFor="companyOrOrganization" className="block text-sm font-medium text-gray-700">Company or Organization</label>
              <div className="mt-1">
                <input
                  id="companyOrOrganization"
                  name="companyOrOrganization"
                  type="text"
                  value={formData.companyOrOrganization}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5"
                  placeholder="Your company name"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Physical Address</label>
              <div className="mt-1">
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5"
                  placeholder="123 Main St, Anytown, USA 12345"
                />
              </div>
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website or Social Profile</label>
              <div className="mt-1">
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5"
                  placeholder="https://www.yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-red hover:bg-custom-red-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? (
                <>
                  {/* Spinner Icon */}
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                isProfileIncomplete ? 'Complete Profile' : 'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileForm;
