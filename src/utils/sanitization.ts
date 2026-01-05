export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as T[Extract<keyof T, string>];
    }
  }
  return sanitized;
};

