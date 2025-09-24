export function isOnboardingComplete(user){
  if(!user) return false;
  return !!(user.isVerified && user.isProfileComplete);
}