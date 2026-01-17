# Shared Type Definitions

This folder contains TypeScript interfaces and types that define contracts between different modules of the application.

## Purpose

These interfaces allow developers to work independently by:
1. **Defining clear contracts** between modules
2. **Enabling mock implementations** during development
3. **Ensuring smooth integration** when modules are combined

## Interface Files

### `auth.types.ts`
- **Defined by**: Developer 1
- **Used by**: Developer 2, Developer 3
- **Purpose**: Authentication and user management contract

### `court.types.ts`
- **Defined by**: Developer 2
- **Used by**: Developer 3
- **Purpose**: Court data and management contract

### `booking.types.ts`
- **Defined by**: Developer 3
- **Purpose**: Booking operations contract

## Usage

### During Development (with mocks)

```typescript
// In Developer 2's code (temporary mock)
import { AuthService } from '@/shared/types/auth.types';

export const mockAuthService: AuthService = {
  isAuthenticated: () => true,
  getCurrentUser: () => ({ id: '1', role: 'administrator', ... }),
  // ... implement all required methods
};
```

### During Integration (with real implementations)

```typescript
// In Developer 2's code (after integration)
import { useAuth } from '@/contexts/AuthContext'; // Real implementation

const authService = useAuth(); // Use real auth service
```

## Rules

1. **Don't modify interfaces** without team discussion
2. **Implement all required methods** in mocks
3. **Keep interfaces simple** - they're contracts, not implementations
4. **Update this README** when adding new interfaces
