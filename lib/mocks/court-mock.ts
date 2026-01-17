/**
 * Mock Court Service for Developer 3
 * 
 * This is a TEMPORARY mock implementation that matches the CourtService interface.
 * During integration, this will be replaced with the real court service from Developer 2.
 * 
 * Purpose: Allow Developer 3 to work independently without waiting for Developer 2's court implementation.
 */

import { CourtService, Court, CourtFilters } from '@/shared/types/court.types';

// Mock court data for testing bookings
const mockCourts: Court[] = [
  {
    id: 'court-outdoor-1',
    name: 'Beach Court A',
    type: 'outdoor',
    location: 'East Coast Park',
    date: new Date('2026-01-25'),
    startTime: '18:00',
    endTime: '20:00',
    description: 'Popular beach volleyball court',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: 'court-outdoor-2',
    name: 'Community Court B',
    type: 'outdoor',
    location: 'Bishan Park',
    date: new Date('2026-01-27'),
    startTime: '19:00',
    endTime: '21:00',
    description: 'Well-lit outdoor court',
    createdAt: new Date('2026-01-16'),
  },
  {
    id: 'court-indoor-1',
    name: 'Sports Hub Indoor Court',
    type: 'indoor',
    location: 'Singapore Sports Hub',
    date: new Date('2026-01-26'),
    startTime: '19:00',
    endTime: '21:00',
    maxSlots: 12,
    bookingMode: 'priority',
    deadline: new Date('2026-01-24'),
    description: 'Air-conditioned indoor court',
    createdAt: new Date('2026-01-17'),
  },
  {
    id: 'court-indoor-2',
    name: 'Futsal Arena Court',
    type: 'indoor',
    location: 'Clementi Arena',
    date: new Date('2026-01-28'),
    startTime: '20:00',
    endTime: '22:00',
    maxSlots: 8,
    bookingMode: 'fcfs',
    description: 'First-come-first-served indoor court',
    createdAt: new Date('2026-01-18'),
  },
];

export const mockCourtService: CourtService = {
  /**
   * Get all courts with optional filtering
   * In real app, this would fetch from backend API
   */
  getCourts: async (filters?: CourtFilters) => {
    let filteredCourts = [...mockCourts];

    // Apply filters if provided
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

    return filteredCourts;
  },

  /**
   * Get a single court by ID
   * In real app, this would fetch from backend API
   */
  getCourtById: async (id: string) => {
    const court = mockCourts.find((c) => c.id === id);
    return court || null;
  },

  /**
   * Create a new court (Admin only)
   * Mock implementation - just returns the court with a new ID
   */
  createCourt: async (court: Omit<Court, 'id' | 'createdAt'>) => {
    const newCourt: Court = {
      ...court,
      id: `court-${Date.now()}`,
      createdAt: new Date(),
    };
    mockCourts.push(newCourt);
    return newCourt;
  },

  /**
   * Update an existing court (Admin only)
   * Mock implementation - updates the court in the array
   */
  updateCourt: async (id: string, updates: Partial<Court>) => {
    const courtIndex = mockCourts.findIndex((c) => c.id === id);
    if (courtIndex === -1) {
      throw new Error(`Court with id ${id} not found`);
    }

    const updatedCourt = { ...mockCourts[courtIndex], ...updates };
    mockCourts[courtIndex] = updatedCourt;
    return updatedCourt;
  },

  /**
   * Delete a court (Admin only)
   * Mock implementation - removes from array
   */
  deleteCourt: async (id: string) => {
    const courtIndex = mockCourts.findIndex((c) => c.id === id);
    if (courtIndex !== -1) {
      mockCourts.splice(courtIndex, 1);
    }
  },
};
