/**
 * Court Service - Developer 2
 * Mock implementation for now, will connect to backend API later
 */

import { Court, CourtFilters, CourtService } from '@/shared/types/court.types';

// In-memory mock data store
let mockCourts: Court[] = [
  {
    id: '1',
    name: 'Outdoor Volleyball Court',
    type: 'outdoor',
    location: 'USC Volleyball Court',
    date: new Date('2026-01-25'),
    startTime: '18:00',
    endTime: '20:00',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'UTSH 1',
    type: 'indoor',
    location: 'UTown',
    date: new Date('2026-01-27'),
    startTime: '19:00',
    endTime: '21:00',
    maxSlots: 12,
    bookingMode: 'fcfs',
    createdAt: new Date(),
  },
];

export const courtService: CourtService = {
  getCourts: async (filters?: CourtFilters): Promise<Court[]> => {
    let filteredCourts = [...mockCourts];

    if (filters) {
      if (filters.type) {
        filteredCourts = filteredCourts.filter((court) => court.type === filters.type);
      }
      if (filters.dateFrom) {
        filteredCourts = filteredCourts.filter(
          (court) => court.date >= filters.dateFrom!
        );
      }
      if (filters.dateTo) {
        filteredCourts = filteredCourts.filter((court) => court.date <= filters.dateTo!);
      }
      if (filters.location) {
        filteredCourts = filteredCourts.filter((court) =>
          court.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
    }

    return filteredCourts.sort((a, b) => a.date.getTime() - b.date.getTime());
  },

  getCourtById: async (id: string): Promise<Court | null> => {
    return mockCourts.find((court) => court.id === id) || null;
  },

  createCourt: async (court: Omit<Court, 'id' | 'createdAt'>): Promise<Court> => {
    const newCourt: Court = {
      ...court,
      id: `court-${Date.now()}`,
      createdAt: new Date(),
    };
    mockCourts.push(newCourt);
    return newCourt;
  },

  updateCourt: async (id: string, updates: Partial<Court>): Promise<Court> => {
    const index = mockCourts.findIndex((court) => court.id === id);
    if (index === -1) {
      throw new Error('Court not found');
    }
    mockCourts[index] = { ...mockCourts[index], ...updates };
    return mockCourts[index];
  },

  deleteCourt: async (id: string): Promise<void> => {
    const index = mockCourts.findIndex((court) => court.id === id);
    if (index === -1) {
      throw new Error('Court not found');
    }
    mockCourts.splice(index, 1);
  },
};
