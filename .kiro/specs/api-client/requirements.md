# Requirements Document

## Introduction

This feature centralizes all HTTP communication in the Expo React Native app through a single axios-based API client. The client automatically attaches JWT access tokens to every outgoing request and silently refreshes expired tokens when a 401 response is received. On unrecoverable auth failure, the client clears credentials and redirects the user to the sign-in screen.

The existing file `src/lib/api.ts` provides an initial implementation; this spec formalizes the requirements so the implementation can be validated, tested, and hardened.

## Glossary

- **API_Client**: The singleton axios instance exported from `src/lib/api-client.ts`
- **Token_Storage**: The utility module at `src/lib/token-storage.ts` that reads and writes tokens via `expo-secure-store`
- **Auth_Store**: The Zustand store at `src/stores/auth-store.ts` that holds in-memory auth state and exposes `signOut`
- **Request_Interceptor**: An axios interceptor that runs before each outgoing request
- **Response_Interceptor**: An axios interceptor that runs after each incoming response
- **Refresh_Queue**: An in-memory queue of pending request resolvers accumulated while a token refresh is in flight
- **BASE_URL**: The backend origin, sourced from the `EXPO_PUBLIC_API_URL` environment variable

---

## Requirements

### Requirement 1: Dependency Setup

**User Story:** As a developer, I want axios available as a project dependency, so that I can make HTTP requests from the app.

#### Acceptance Criteria

1. THE API_Client SHALL use axios as its HTTP transport library.
2. WHERE `axios` is not yet listed in `package.json` dependencies, THE project SHALL add it before the API_Client module is usable.

---

### Requirement 2: Centralized API Client Module

**User Story:** As a developer, I want a single API client module, so that all HTTP calls share the same base configuration.

#### Acceptance Criteria

1. THE API_Client SHALL be created in `src/lib/api-client.ts`.
2. THE API_Client SHALL be initialized with a `baseURL` equal to the value of the `EXPO_PUBLIC_API_URL` environment variable.
3. IF `EXPO_PUBLIC_API_URL` is not set, THEN THE API_Client SHALL fall back to `http://localhost:3000`.
4. THE API_Client SHALL export the axios instance as a named export `api`.
5. THE API_Client module SHALL be fully typed in TypeScript with strict mode compatibility.

---

### Requirement 3: Request Interceptor — Authorization Header

**User Story:** As a developer, I want every request to include the JWT token, so that authenticated endpoints accept the call without manual header management.

#### Acceptance Criteria

1. WHEN a request is dispatched by the API_Client, THE Request_Interceptor SHALL read the access token from Token_Storage.
2. WHEN a valid access token is present, THE Request_Interceptor SHALL attach the header `Authorization: Bearer <token>` to the request config.
3. WHEN no access token is present, THE Request_Interceptor SHALL forward the request without an `Authorization` header.
4. THE Request_Interceptor SHALL be typed using `InternalAxiosRequestConfig` from the axios type definitions.

---

### Requirement 4: Response Interceptor — Token Refresh on 401

**User Story:** As a user, I want my session to continue seamlessly when my access token expires, so that I am not unexpectedly logged out mid-session.

#### Acceptance Criteria

1. WHEN the API_Client receives a response with HTTP status `401`, THE Response_Interceptor SHALL attempt a token refresh before propagating the error.
2. WHEN a token refresh is already in progress and a second `401` response arrives, THE Response_Interceptor SHALL queue the second request and resolve it with the new token once the refresh completes.
3. WHEN the token refresh succeeds, THE Response_Interceptor SHALL update Token_Storage with the new access token.
4. WHEN the token refresh succeeds, THE Response_Interceptor SHALL retry each queued request with the new `Authorization: Bearer <token>` header.
5. WHEN a request has already been retried once (`_retry` flag set), THE Response_Interceptor SHALL not attempt another refresh and SHALL reject with the original error.
6. THE Response_Interceptor SHALL call the refresh endpoint `POST /auth/refresh` with the current refresh token in the request body.
7. THE Response_Interceptor SHALL be typed using `AxiosError` from the axios type definitions.

---

### Requirement 5: Sign-Out on Refresh Failure

**User Story:** As a user, I want to be redirected to the sign-in screen when my session cannot be recovered, so that I can re-authenticate without being stuck in a broken state.

#### Acceptance Criteria

1. WHEN the token refresh request fails, THE Response_Interceptor SHALL clear all tokens from Token_Storage.
2. WHEN the token refresh request fails, THE Response_Interceptor SHALL drain the Refresh_Queue by rejecting all pending requests with the refresh error.
3. WHEN the token refresh request fails, THE Response_Interceptor SHALL call `signOut` on the Auth_Store to reset in-memory auth state.
4. WHEN `signOut` is called due to refresh failure, THE app navigation SHALL redirect the user to the sign-in screen (handled by the root layout's `isAuthenticated` guard).

---

### Requirement 6: TypeScript Types

**User Story:** As a developer, I want all interceptor code to be properly typed, so that type errors surface at compile time rather than at runtime.

#### Acceptance Criteria

1. THE API_Client module SHALL import and use `AxiosError` and `InternalAxiosRequestConfig` from the `axios` package.
2. THE `_retry` flag on request configs SHALL be declared as an optional boolean property extending `InternalAxiosRequestConfig`.
3. THE Refresh_Queue SHALL be typed as `Array<(token: string) => void>`.
4. THE response from the refresh endpoint SHALL be typed as `{ accessToken: string }`.
