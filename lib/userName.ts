/**
 * Helper functions for resolving and formatting user names
 */

/**
 * Gets the first name from a full name string
 */
export function getFirstName(name?: string): string {
  if (!name) return '';
  return name.trim().split(/\s+/)[0];
}

/**
 * Resolves the display name for a user
 * Priority: displayName (first name) > username > fallback
 */
export function resolveUserName(u?: { 
  name?: string; 
  username?: string; 
}): string {
  const firstName = getFirstName(u?.name);
  if (firstName) return firstName;
  
  if (u?.username) return u.username;
  
  return 'parcero';
}

