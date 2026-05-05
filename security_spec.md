# Security Specification - Syncro Team Task Manager

## Data Invariants
1. A user can only be an Admin or Member of a project.
2. A task must belong to a valid project.
3. Only project Admins can create tasks or manage members.
4. Members can update task status and priority if assigned or if they are project members.
5. Users can only see projects they are members of.

## The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: Attempt to create a project with an `ownerId` that is not the current user's UID.
2. **Privilege Escalation**: A documented 'Member' attempting to update their own role to 'Admin'.
3. **Ghost Field Injection**: Adding a `verfied: true` field to a Task.
4. **ID Poisoning**: Creating a project with a 2KB string as the ID.
5. **Orphaned Member**: Adding a member to a project that doesn't exist.
6. **Self-Promotion**: A user adding themselves to a project they don't belong to.
7. **Bypassing Immutability**: Attempting to change `createdAt` on a Task.
8. **Invalid Status**: Setting Task status to "Exploding".
9. **PII Leak**: A non-member attempting to 'get' another user's private email from `/users/{userId}`.
10. **Shadow Update**: Updating a Task with a field `urgentOverride: true` which is not in the schema.
11. **Malicious Query**: Trying to list all tasks across all projects without being a member of them.
12. **Assignee Fraud**: Assigning a task to a user who is not a member of the project.

## Test Runner (Logic Verification)
The `firestore.rules` will be tested against these invariants using strict `isValidId` and `isValid[Entity]` helpers.
