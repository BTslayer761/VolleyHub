# VolleyHub - Quick Start Guide for 3 Developers

## Overview

This project is split into **3 independent modules** that can be developed in parallel with **zero dependencies** during development.

## Getting Started (First Day)

### Step 1: Team Meeting (30 minutes)
1. Review `DEVELOPMENT_SPLIT.md` together
2. Review interface contracts in `shared/types/`
3. Agree on any changes to interfaces
4. Assign developers (Dev 1, Dev 2, Dev 3)

### Step 2: Setup Your Environment (30 minutes)
```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm start
```

### Step 3: Choose Your Module

#### 👤 **Developer 1: Authentication**
- Start with: `shared/types/auth.types.ts`
- Create: Backend auth API + Frontend auth screens
- No dependencies needed!

#### 🏐 **Developer 2: Court Management**
- Start with: `shared/types/court.types.ts` and `shared/types/auth.types.ts`
- Create: Mock auth service (see below) + Court management
- Dependency: Mock `AuthService` interface

#### 📅 **Developer 3: Booking System**
- Start with: All files in `shared/types/`
- Create: Mock auth + Mock court services (see below) + Booking system
- Dependencies: Mock `AuthService` and `CourtService` interfaces

## Creating Mocks (For Dev 2 & Dev 3)

### Example: Mock Auth Service (Developer 2 & 3)

Create `app/mocks/auth-mock.ts`:

```typescript
import { AuthService, User } from '@/shared/types/auth.types';

export const mockAuthService: AuthService = {
  isAuthenticated: () => true,  // Always true for dev
  getCurrentUser: () => ({
    id: 'dev-user-123',
    email: 'dev@example.com',
    name: 'Dev User',
    role: 'administrator'  // Change to 'user' for Dev 3
  }),
  hasRole: (role) => role === 'administrator',  // Always admin for Dev 2
  getAuthToken: () => 'mock-jwt-token',
  login: async (email, password) => {
    return mockAuthService.getCurrentUser()!;
  },
  logout: async () => {},
  register: async (email, password, name) => {
    return mockAuthService.getCurrentUser()!;
  }
};
```

### Example: Mock Court Service (Developer 3)

Create `app/mocks/court-mock.ts`:

```typescript
import { CourtService, Court } from '@/shared/types/court.types';

export const mockCourtService: CourtService = {
  getCourts: async (filters) => {
    // Return mock courts
    return [
      {
        id: '1',
        name: 'Beach Court A',
        type: 'outdoor',
        location: 'East Coast Park',
        date: new Date('2026-01-20'),
        startTime: '18:00',
        endTime: '20:00'
      },
      {
        id: '2',
        name: 'Indoor Court B',
        type: 'indoor',
        location: 'Sports Hub',
        date: new Date('2026-01-22'),
        startTime: '19:00',
        endTime: '21:00',
        maxSlots: 12,
        bookingMode: 'priority',
        deadline: new Date('2026-01-21')
      }
    ];
  },
  getCourtById: async (id) => {
    const courts = await mockCourtService.getCourts();
    return courts.find(c => c.id === id) || null;
  },
  createCourt: async (court) => ({ ...court, id: 'new-id', createdAt: new Date() }),
  updateCourt: async (id, updates) => {
    const court = await mockCourtService.getCourtById(id);
    return { ...court!, ...updates };
  },
  deleteCourt: async (id) => {}
};
```

## Development Workflow

### ✅ Independent Phase (Weeks 1-2)
- Work on your module independently
- Use mocks for dependencies
- Test your module in isolation
- No need to wait for others!

### 🔄 Integration Phase (Week 3)
- Replace mocks with real implementations
- Test integration points
- Fix any interface mismatches

### 🎨 Polish Phase (Week 4)
- UI/UX improvements
- Bug fixes
- Final testing

## File Ownership

### Developer 1
- `backend/routes/auth.ts`
- `backend/models/User.ts`
- `app/(tabs)/settings.tsx`
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/contexts/AuthContext.tsx`

### Developer 2
- `backend/routes/courts.ts`
- `backend/models/Court.ts`
- `app/(tabs)/courts.tsx` (rename from `explore.tsx`)
- `app/(admin)/courts/manage.tsx`
- `app/mocks/auth-mock.ts` (temporary)

### Developer 3
- `backend/routes/bookings.ts`
- `backend/models/Booking.ts`
- `app/(tabs)/index.tsx` (Home tab)
- `app/components/booking/*`
- `app/mocks/auth-mock.ts` (temporary)
- `app/mocks/court-mock.ts` (temporary)

## Tips

1. **Use TypeScript interfaces** - They're your contracts!
2. **Keep mocks simple** - Just enough to unblock development
3. **Commit often** - Each developer works on separate files
4. **Communicate changes** - If you need to modify an interface, discuss first
5. **Test with mocks** - Make sure your module works end-to-end with mocks

## Common Questions

**Q: Can I modify the shared types?**  
A: Only if you discuss with the team first. These are contracts!

**Q: What if I need data from another module?**  
A: Use the mock! It matches the real interface, so integration will be easy.

**Q: When do I remove mocks?**  
A: During integration week, replace mocks with real services.

**Q: Can I create the backend folder structure?**  
A: Yes! Each developer can set up their own backend routes independently.

---

Happy coding! 🏐
