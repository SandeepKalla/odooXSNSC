const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'An error occurred',
        };
      }

      return { data };
    } catch (error: any) {
      return {
        error: error.message || 'Network error',
      };
    }
  }

  // Auth
  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Trips
  async createTrip(tripData: any) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async getTrips(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/trips${query}`);
  }

  async getTrip(id: string) {
    return this.request(`/trips/${id}`);
  }

  async updateTrip(id: string, tripData: any) {
    return this.request(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  }

  async deleteTrip(id: string) {
    return this.request(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  // Sections
  async createSection(tripId: string, sectionData: any) {
    return this.request(`/trips/${tripId}/sections`, {
      method: 'POST',
      body: JSON.stringify(sectionData),
    });
  }

  async updateSection(tripId: string, sectionId: string, sectionData: any) {
    return this.request(`/trips/${tripId}/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(sectionData),
    });
  }

  async deleteSection(tripId: string, sectionId: string) {
    return this.request(`/trips/${tripId}/sections/${sectionId}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async addActivityToSection(sectionId: string, activityData: any) {
    return this.request(`/sections/${sectionId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async updateSectionActivity(sectionId: string, activityId: string, activityData: any) {
    return this.request(`/sections/${sectionId}/activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    });
  }

  async removeActivityFromSection(sectionId: string, activityId: string) {
    return this.request(`/sections/${sectionId}/activities/${activityId}`, {
      method: 'DELETE',
    });
  }

  // Search
  async searchCities(query?: string, country?: string) {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (country) params.append('country', country);
    return this.request(`/search/cities?${params.toString()}`);
  }

  async searchActivities(query?: string, type?: string, cityId?: string, maxCost?: number) {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (type) params.append('type', type);
    if (cityId) params.append('cityId', cityId);
    if (maxCost) params.append('maxCost', maxCost.toString());
    return this.request(`/search/activities?${params.toString()}`);
  }

  // Public/Community
  async publishTrip(tripId: string) {
    return this.request(`/public/trips/${tripId}/publish`, {
      method: 'POST',
    });
  }

  async getPublicTrips() {
    return this.request('/public/trips');
  }

  async getPublicTrip(slug: string) {
    return this.request(`/public/trips/${slug}`);
  }

  async copyTrip(slug: string) {
    return this.request(`/public/trips/${slug}/copy`, {
      method: 'POST',
    });
  }

  // Admin
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  // Profile
  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async saveDestination(cityId: string) {
    return this.request('/auth/saved-destinations', {
      method: 'POST',
      body: JSON.stringify({ cityId }),
    });
  }

  async removeSavedDestination(cityId: string) {
    return this.request(`/auth/saved-destinations/${cityId}`, {
      method: 'DELETE',
    });
  }

  // External APIs
  async getCountryData(countryName: string) {
    return this.request(`/external/country/${countryName}`);
  }

  async getCityImages(cityId: string) {
    return this.request(`/external/city/${cityId}/images`);
  }

  async getCityWeather(cityId: string) {
    return this.request(`/external/city/${cityId}/weather`);
  }

  async getCityPlaces(cityId: string, kinds?: string, radius?: number) {
    const params = new URLSearchParams();
    if (kinds) params.append('kinds', kinds);
    if (radius) params.append('radius', radius.toString());
    return this.request(`/external/city/${cityId}/places?${params.toString()}`);
  }

  async getPlaceDetails(xid: string) {
    return this.request(`/external/place/${xid}`);
  }

  async getExchangeRates(baseCurrency?: string) {
    const query = baseCurrency ? `?base=${baseCurrency}` : '';
    return this.request(`/external/exchange-rates${query}`);
  }

  async geocodeCity(cityName: string, country?: string) {
    return this.request('/external/geocode', {
      method: 'POST',
      body: JSON.stringify({ cityName, country }),
    });
  }
}

export const api = new ApiClient();

