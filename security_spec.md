# Security Spec for NexusPresent

## 1. Data Invariants
- A presentation must have a valid host ID matching the user.
- A slide can only be created by the host of the parent presentation.
- A chat message can only be added by authenticated users, and its presentationId must match the parent.
- Only the host can transition the status of a presentation or change the current slide index.

## 2. The Dirty Dozen Payloads
1. Presentation with bad hostId
2. Presentation missing status
3. Presentation with invalid status random string
4. Slide without order
5. Slide update altering presentationId
6. Message without valid text
7. Message with forged userId
8. Non-host trying to update currentSlideIndex
9. Non-host trying to update status
10. Slide update with massive string
11. Blanket list query attempt without filtering
12. Presentation update altering hostId

## 3. Test Runner
We will write rules that block all these invalid operations.
