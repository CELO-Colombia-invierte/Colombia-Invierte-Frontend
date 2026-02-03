export const isProfileComplete = (user: any | null): boolean => {
  if (!user) {
    return false;
  }

  const displayName = (user as any).displayName || (user as any).display_name;
  const email = user.email;
  const username = user.username;

  const hasValidEmail = email && !email.includes('@temp.thirdweb');
  const hasValidUsername = username && !username.startsWith('user_');
  const hasValidDisplayName = displayName && !displayName.startsWith('Wallet ');

  return Boolean(hasValidEmail && hasValidUsername && hasValidDisplayName);
};

export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const isValidDisplayName = (displayName: string): boolean => {
  return displayName.trim().length >= 2 && displayName.trim().length <= 50;
};
