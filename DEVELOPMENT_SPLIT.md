# VolleyHub - Independent Development Split (No Dependencies)

This document outlines a **decoupled** division of work where each developer can work completely independently using mocks/interfaces, then integrate later.

---

## **Development Philosophy: Contract-Based Development**

Each developer will:
1. **Define interfaces/contracts** that other developers must implement
2. **Use mock/stub implementations** during development
3. **Work in isolation** until integration phase
4. **No blocking dependencies** - can develop in parallel

---

## **Developer 1: Authentication & User Management Module**

### Backend Responsibilities:
1. **Standalone Authentication System**
   - User registration/creation API endpoints
   - Login/logout functionality
   - JWT token management
   - Password hashing and security
   - Permission system (User/Administrator roles)
   - Auth middleware that can be imported by others

2. **User Management APIs**
   - User profile CRUD operations
   - User information retrieval
   - Role management endpoints

3. **Export Auth Interface for Others**
   ```typescript
   // interfaces/auth-service.ts (to be used by Dev 2 & 3)
   export interface AuthService {
     isAuthenticated(): boolean;
     getCurrentUser(): User | null;
     hasRole(role: 'user' | 'administrator'): boolean;
     getAuthToken(): string | null;
   }
   ```

### Frontend Responsibilities:
1. **Settings Tab** (`app/(tabs)/settings.tsx`)
   - User profile display and editing
   - Account settings
   - Logout functionality
   - Authentication state management

2. **Authentication Screens** (`app/(auth)/login.tsx`, `app/(auth)/register.tsx`)
   - Login screen
   - Registration screen
   - Password reset (optional)

3. **Auth Context/Provider** (`contexts/AuthContext.tsx`)
   - Global auth state management
   - Can be consumed by other tabs

### Mock Dependencies Needed:
- None! This is the foundation module

### Key Deliverables:
- ✅ Complete auth backend API
- ✅ Auth frontend screens and Settings tab
- ✅ Auth interfaces exported for others to implement
- ✅ AuthContext provider for app-wide auth state

### Files Structure:
```
backend/
  ├── routes/auth.ts              (Developer 1)
  ├── models/User.ts              (Developer 1)
  ├── middleware/auth.ts          (Developer 1)
  └── interfaces/
      └── auth-service.ts         (Developer 1 - defines contract)

app/
  ├── (tabs)/settings.tsx         (Developer 1)
  ├── (auth)/
  │   ├── login.tsx               (Developer 1)
  │   └── register.tsx            (Developer 1)
  └── contexts/
      └── AuthContext.tsx         (Developer 1)
```

---

## **Developer 2: Court Management Module**

### Backend Responsibilities:
1. **Standalone Court Posting APIs**
   - Create/Read/Update/Delete outdoor courts
   - Create/Read/Update/Delete indoor courts
   - **Use Mock Auth Check** (will replace with real auth during integration)
   - Court data models (outdoor vs indoor types)

2. **Indoor Court Slot Management**
   - Ad Hoc (FCFS - First Come First Served) court posting
   - Weekly sorting system:
     - Allow users to indicate preferences for the week
     - Priority-based sorting algorithm
     - Allocate at least 1 slot based on priority
     - Additional slot allocation if available
   - Deadline management for slot allocation

3. **Court Listing APIs**
   - Get all courts (with filtering by type: indoor/outdoor)
   - Get court details
   - Date-based filtering

4. **Export Court Interface for Others**
   ```typescript
   // interfaces/court-service.ts (to be used by Dev 3)
   export interface Court {
     id: string;
     name: string;
     type: 'outdoor' | 'indoor';
     location: string;
     date: Date;
     // ... other fields
   }
   
   export interface CourtService {
     getCourts(filters?: CourtFilters): Promise<Court[]>;
     getCourtById(id: string): Promise<Court | null>;
   }
   ```

### Frontend Responsibilities:
1. **Admin Interface** (`app/(admin)/courts/manage.tsx` or modal)
   - Court creation form (outdoor)
   - Court creation form (indoor - with slot configuration)
   - Court listing management for admins
   - Edit/Delete court functionality
   - **Use Mock Auth** to check admin status (return true for now)

2. **Courts Tab** (`app/(tabs)/courts.tsx` or rename `explore.tsx`)
   - Display upcoming courts
   - Filter by indoor/outdoor
   - Filter by date
   - Sort options
   - Court detail views
   - **Booking button placeholder** (will be replaced by Dev 3's component)

### Mock Dependencies:
```typescript
// mocks/auth-mock.ts (temporary, will use real auth later)
export const mockAuthService: AuthService = {
  isAuthenticated: () => true,  // For dev purposes
  getCurrentUser: () => ({ id: '1', role: 'administrator' }),
  hasRole: (role) => role === 'administrator',  // Always admin for dev
  getAuthToken: () => 'mock-token'
};
```

### Key Deliverables:
- ✅ Complete court management backend API
- ✅ Courts tab with filtering/sorting
- ✅ Admin court posting interface
- ✅ Court interfaces exported for others
- ✅ Works with mock auth (no dependency on Dev 1)

### Files Structure:
```
backend/
  ├── routes/courts.ts            (Developer 2)
  ├── models/Court.ts             (Developer 2)
  ├── services/slot-sorter.ts     (Developer 2)
  └── interfaces/
      └── court-service.ts        (Developer 2 - defines contract)

app/
  ├── (tabs)/courts.tsx           (Developer 2)
  ├── (admin)/courts/manage.tsx   (Developer 2)
  ├── components/court-card.tsx   (Developer 2)
  └── mocks/
      └── auth-mock.ts            (Developer 2 - temporary)
```

---

## **Developer 3: Booking System Module**

### Backend Responsibilities:
1. **Standalone Booking APIs**
   - Outdoor court bookings (RSVP/going list)
   - Indoor court slot bookings
   - Booking CRUD operations
   - **Use Mock Court Service** (will replace during integration)
   - **Use Mock Auth** (will replace during integration)

2. **Outdoor Court Bookings**
   - Users can indicate "going" to outdoor courts
   - Simple list/RSVP system
   - Get list of people going to a court
   - User can remove themselves from going list

3. **Indoor Court Bookings**
   - Users can request/book indoor court slots
   - Slot assignment after deadline (limited slots)
   - Waiting list management
   - Notification system when slots are assigned
   - Get list of confirmed participants after deadline

### Frontend Responsibilities:
1. **Home Tab** (`app/(tabs)/index.tsx`)
   - Display user's upcoming bookings
   - Show booking status (confirmed, pending, etc.)
   - Quick actions (cancel, view details)
   - Empty state when no bookings
   - **Uses Mock Auth** to get current user ID

2. **Booking Components** (`components/booking/`)
   - `OutdoorBookingButton.tsx` - "Going" button for outdoor courts
   - `IndoorBookingButton.tsx` - "Request Slot" button for indoor courts
   - `ParticipantsList.tsx` - Display list of people going/participants
   - `BookingConfirmation.tsx` - Booking confirmation UI
   - These can be dropped into Dev 2's Courts tab later

### Mock Dependencies:
```typescript
// mocks/auth-mock.ts (temporary)
export const mockAuthService: AuthService = {
  isAuthenticated: () => true,
  getCurrentUser: () => ({ id: 'user-123', role: 'user' }),
  hasRole: (role) => role === 'user',
  getAuthToken: () => 'mock-token'
};

// mocks/court-mock.ts (temporary)
export const mockCourtService: CourtService = {
  getCourts: async () => [
    { id: '1', name: 'Court A', type: 'outdoor', ... },
    { id: '2', name: 'Court B', type: 'indoor', ... }
  ],
  getCourtById: async (id) => ({ id, name: 'Mock Court', ... })
};
```

### Key Deliverables:
- ✅ Complete booking backend API
- ✅ Home tab showing user bookings
- ✅ Reusable booking components
- ✅ Works with mock auth and mock courts (no dependencies)

### Files Structure:
```
backend/
  ├── routes/bookings.ts          (Developer 3)
  ├── models/Booking.ts           (Developer 3)
  └── interfaces/
      └── booking-service.ts      (Developer 3)

app/
  ├── (tabs)/index.tsx            (Developer 3 - Home)
  ├── components/booking/
  │   ├── OutdoorBookingButton.tsx (Developer 3)
  │   ├── IndoorBookingButton.tsx  (Developer 3)
  │   ├── ParticipantsList.tsx     (Developer 3)
  │   └── BookingConfirmation.tsx  (Developer 3)
  └── mocks/
      ├── auth-mock.ts            (Developer 3 - temporary)
      └── court-mock.ts           (Developer 3 - temporary)
```

---

## **Integration Phase (After Individual Development)**

Once all modules are complete, replace mocks with real implementations:

### Step 1: Replace Auth Mocks
- Developer 2 & 3: Replace `auth-mock.ts` with import from `AuthContext`
- Test admin checks and user authentication

### Step 2: Replace Court Mocks
- Developer 3: Replace `court-mock.ts` with real court service from Developer 2
- Test booking flow with real courts

### Step 3: Integrate Components
- Add Developer 3's booking components to Developer 2's Courts tab
- Ensure Home tab fetches real bookings from real courts

---

## **Shared Directory for Contracts**

Create a shared folder with TypeScript interfaces that all developers agree on:

```
shared/
  ├── types/
  │   ├── auth.types.ts           (Dev 1 defines, all implement)
  │   ├── court.types.ts          (Dev 2 defines, Dev 3 uses)
  │   └── booking.types.ts        (Dev 3 defines)
  └── README.md                   (Documentation of contracts)
```

**Key Rule**: Each developer implements their own mocks that match these interfaces, so integration is just swapping implementations.

---

## **Development Workflow**

### Phase 1: Independent Development (Weeks 1-2)
- ✅ Developer 1: Build auth system (standalone)
- ✅ Developer 2: Build court system with mock auth
- ✅ Developer 3: Build booking system with mock auth & courts
- ✅ All can work in parallel, no blocking

### Phase 2: Integration (Week 3)
- 🔄 Replace mocks with real implementations
- 🔄 Connect components together
- 🔄 End-to-end testing

### Phase 3: Polish (Week 4)
- 🎨 UI/UX improvements
- 🐛 Bug fixes
- ✅ Final testing

---

## **Key Benefits of This Approach**

✅ **Zero Blocking**: No developer waits for another  
✅ **Parallel Development**: All work simultaneously  
✅ **Clear Contracts**: Interfaces define integration points  
✅ **Easy Testing**: Mock data makes testing straightforward  
✅ **Smooth Integration**: Just swap mock for real implementation  
✅ **Isolated Changes**: Changes in one module don't break others  

---

## **Communication Protocol**

1. **Define interfaces first** (first few hours of Day 1)
   - All 3 developers meet to agree on TypeScript interfaces
   - Document in `shared/types/` folder
   - These become the "contract"

2. **Daily standups** (5-10 mins)
   - Show progress on your isolated module
   - Mention any interface changes needed

3. **Integration meeting** (start of Week 3)
   - Walk through replacing mocks
   - Test integration together

---

Good luck with parallel development! 🏐