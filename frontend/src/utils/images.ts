/**
 * Utility functions for generating image URLs
 * Falls back to Unsplash source API if API key not configured
 */

/**
 * Get a placeholder image URL for a city
 * Uses Unsplash API with a direct image URL as fallback
 * For better images, use the API endpoint: /api/external/city/:cityId/images
 */
export const getCityImageUrl = (cityName: string, country?: string): string => {
  // Use a direct Unsplash image URL as fallback (travel/city themed)
  // This is more reliable than the deprecated source.unsplash.com
  return `https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop&q=80&auto=format`;
};

/**
 * Get city image from API (better quality, requires API key)
 */
export const getCityImageFromApi = async (cityId: string): Promise<string | null> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/external/city/${cityId}/images`);
    if (response.ok) {
      const data = await response.json();
      return data.images?.[0]?.urls?.regular || null;
    }
  } catch (error) {
    console.error('Failed to fetch city image:', error);
  }
  return null;
};

/**
 * Get a placeholder image URL for a trip
 */
export const getTripImageUrl = (tripName: string): string => {
  const searchTerm = encodeURIComponent(`${tripName} travel vacation`);
  return `https://source.unsplash.com/400x300/?${searchTerm}`;
};

/**
 * Get a placeholder image URL for a banner
 * Uses a direct Unsplash image URL
 */
export const getBannerImageUrl = (): string => {
  // Use a direct Unsplash image URL (travel/adventure themed)
  return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop&q=80&auto=format`;
};

/**
 * Get a placeholder profile photo URL
 * Uses UI Avatars or a default avatar service
 */
export const getProfilePhotoUrl = (name?: string, size: number = 100): string => {
  if (name) {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=4a9eff&color=ffffff&bold=true`;
  }
  return `https://ui-avatars.com/api/?name=User&size=${size}&background=4a9eff&color=ffffff&bold=true`;
};

/**
 * Get an activity image URL
 */
export const getActivityImageUrl = (activityName: string, activityType?: string): string => {
  const searchTerm = encodeURIComponent(`${activityName} ${activityType || 'activity'}`);
  return `https://source.unsplash.com/400x300/?${searchTerm}`;
};

