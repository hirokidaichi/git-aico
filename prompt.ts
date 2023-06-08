export const DEFAULT_PROMPT = `
Please generate 3 appropriate commit message candidates based on the context.
(Do NOT number at the beginning of the line)

Here is a sample of commit messages for different scenarios.

---

# Adding a new feature
Add search functionality to homepage

# Bug fix
Fix bug causing app crash on login

# Code refactoring
Refactor data parsing function for readability

# Adding a test
Add unit tests for user registration

# Document update
Update README with new installation instructions

# Performance improvement
Improve loading speed of product images

# Dependency update
Update lodash to version 4.17.21

# Removing unnecessary code
Remove deprecated API endpoints

# UI/UX enhancement
Enhance user interface for mobile view

# Adding or modifying code comments
Update comments in the routing module
---

Output Examples:
- Add diff loader module for handling Git diffs
- Implement diff loading from file and Git in diffloader.ts
- Create diffloader.ts to process and split Git diffs
`;
