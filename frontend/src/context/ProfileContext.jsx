import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const DEFAULT_PROFILE = {
  name: 'Prisha Oberoi',
  handle: '@prisha_oberoi',
  email: '',
  photoUri: null,
  qrCodeUri: null,
  upiId: 'prisha@upi',
  bankAccount: '',
  gentleReminders: true,
};

const ProfileContext = createContext(undefined);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const updatePhoto = (uri) => {
    setProfile((prev) => ({ ...prev, photoUri: uri }));
  };

  const updateProfile = (updates) => {
    setProfile((prev) => {
      const newName = updates.name !== undefined ? updates.name : prev.name;
      const firstName = newName ? newName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : 'user';
      const handle = updates.handle || `@${newName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const upiId = updates.upiId !== undefined ? updates.upiId : (prev.upiId || `${firstName}@upi`);
      const bankAccount = updates.bankAccount !== undefined ? updates.bankAccount : prev.bankAccount;
      const gentleReminders = updates.gentleReminders !== undefined ? updates.gentleReminders : prev.gentleReminders;
      const qrCodeUri = updates.qrCodeUri !== undefined ? updates.qrCodeUri : prev.qrCodeUri;
      const photoUri = updates.photoUri !== undefined ? updates.photoUri : prev.photoUri;
      const email = updates.email !== undefined ? updates.email : prev.email;

      return {
        ...prev,
        ...updates,
        name: newName,
        handle,
        email,
        upiId,
        bankAccount,
        gentleReminders,
        qrCodeUri,
        photoUri,
      };
    });
  };

  // Sync with MongoDB backend on mount
  useEffect(() => {
    authService.getProfile().then((res) => {
      if (res?.user) {
        updateProfile({
          name: res.user.name,
          email: res.user.email,
          photoUri: res.user.photoUri || null,
          qrCodeUri: res.user.qrCodeUri || null,
          upiId: res.user.upiId || undefined,
          bankAccount: res.user.bankAccount || '',
          gentleReminders: res.user.gentleReminders ?? true,
        });
      }
    }).catch(() => {});
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updatePhoto, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
