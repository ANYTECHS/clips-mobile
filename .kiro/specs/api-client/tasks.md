# Implementation Plan: API Client

## Tasks

- [x] 1. Install fast-check dev dependency for property tests
  - Add `fast-check` to devDependencies
  - _Requirements: 6.1_

- [x] 2. Create `src/lib/api-client.ts`
  - [x] 2.1 Implement the axios instance with BASE_URL env var and fallback
    - Create `src/lib/api-client.ts` with axios.create, baseURL from EXPO_PUBLIC_API_URL
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 2.2 Implement the request interceptor
    - Read access token from tokenStorage, attach Authorization header
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 2.3 Implement the response interceptor with refresh queue
    - Handle 401, isRefreshing flag, RefreshQueue, retry logic
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [x] 2.4 Implement sign-out on refresh failure
    - Clear tokens, drain queue with rejections, call signOut
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Checkpoint — verify TypeScript compiles cleanly
  - Run tsc --noEmit and fix any type errors
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Write tests for api-client
  - [x]\* 4.1 Write unit tests for request interceptor
    - Token present → header attached; token null → no header
    - _Requirements: 3.2, 3.3_
  - [x]\* 4.2 Write unit tests for response interceptor
    - Non-401 passed through; \_retry flag set on retry; refresh endpoint called with correct payload
    - _Requirements: 4.1, 4.5, 4.6_
  - [x]\* 4.3 Write unit tests for sign-out flow
    - clearTokens, queue drain, signOut all called on refresh failure
    - _Requirements: 5.1, 5.2, 5.3_
  - [x]\* 4.4 Write property test — P1: Token always attached
    - Feature: api-client, Property 1: Token is always attached when present
    - _Requirements: 3.2_
  - [x]\* 4.5 Write property test — P2: No header when token absent
    - Feature: api-client, Property 2: No Authorization header when token is absent
    - _Requirements: 3.3_
  - [x]\* 4.6 Write property test — P3: Exactly one refresh per N concurrent 401s
    - Feature: api-client, Property 3: Exactly one refresh fires for any number of concurrent 401s
    - _Requirements: 4.1, 4.2_
  - [x]\* 4.7 Write property test — P4: Queued requests retried with new token
    - Feature: api-client, Property 4: All queued requests are retried with the new token
    - _Requirements: 4.3, 4.4_
  - [x]\* 4.8 Write property test — P5: Retry loop prevention
    - Feature: api-client, Property 5: Retry loop prevention
    - _Requirements: 4.5_
  - [x]\* 4.9 Write property test — P6: Total sign-out on refresh failure
    - Feature: api-client, Property 6: Sign-out on refresh failure is total
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. Final checkpoint — all tests pass
  - Run jest and confirm all tests pass
