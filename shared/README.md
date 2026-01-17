# Shared Directory

This directory contains shared types, interfaces, and contracts that enable independent parallel development.

## Structure

```
shared/
  ├── types/              # TypeScript interfaces and types
  │   ├── auth.types.ts   # Auth contract (Dev 1 → Dev 2, 3)
  │   ├── court.types.ts  # Court contract (Dev 2 → Dev 3)
  │   └── booking.types.ts # Booking contract (Dev 3)
  └── README.md           # This file
```

## Development Workflow

1. **Day 1 Morning**: All developers meet to review and agree on interfaces
2. **Development Phase**: Each developer implements mocks matching these interfaces
3. **Integration Phase**: Replace mocks with real implementations

## Integration Checklist

- [ ] Developer 2 & 3: Replace `auth-mock.ts` with real `AuthContext`
- [ ] Developer 3: Replace `court-mock.ts` with real court service
- [ ] Test all integrations work together
- [ ] Remove mock files after successful integration
