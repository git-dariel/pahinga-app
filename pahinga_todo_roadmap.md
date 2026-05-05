# Pahinga TODO Roadmap

## Tech Stack

- Electron
- React
- TypeScript
- Tailwind CSS
- SQLite

## Architecture Direction

Use **Service-Oriented Architecture with Repository Pattern**.

The frontend should handle UI and user interaction.

The backend/main process should handle local database operations, reminder logic, session tracking, and Electron system features.

---

# Phase 0: Project Setup

## Frontend TODO

- [x] Initialize React + TypeScript renderer setup.
- [x] Install and configure Tailwind CSS.
- [x] Set up global CSS file.
- [x] Add Inter font or selected font family.
- [x] Create base layout structure.
- [x] Create reusable UI components folder.
- [x] Create pages folder.
- [x] Create hooks folder.
- [x] Create renderer services folder.
- [x] Set up basic routing or page state navigation.
- [x] Create initial app shell with sidebar layout.
- [x] Add placeholder pages:
  - [x] Dashboard
  - [x] Focus Timer
  - [x] Stretch Guide
  - [x] Daily Summary
  - [x] Settings
- [x] Create Tailwind color tokens based on the selected color palette.

## Backend TODO

- [x] Initialize Electron main process.
- [x] Configure TypeScript for Electron.
- [x] Configure Electron preload script.
- [x] Set up secure IPC communication.
- [x] Disable unsafe Node.js access in renderer.
- [x] Create main process folder structure.
- [x] Create database folder.
- [x] Create repositories folder.
- [x] Create services folder.
- [x] Install SQLite package.
- [x] Create SQLite database connection.
- [x] Create migration runner.
- [x] Create initial database file path configuration.
- [x] Add development command for running Electron + React together.
- [x] Add production build command.

---

# Phase 1: Database and Local Storage

## Frontend TODO

- [x] Create TypeScript interfaces for:
  - [x] User settings
  - [x] Focus session
  - [x] Reminder
  - [x] Stretch log
  - [x] Daily summary
- [x] Create renderer API service wrapper for IPC calls.
- [x] Add loading and error states for data fetching.
- [x] Add basic toast or notification UI component.

## Backend TODO

- [x] Create `user_settings` table.
- [x] Create `focus_sessions` table.
- [x] Create `reminders` table.
- [x] Create `stretch_logs` table.
- [x] Create settings repository.
- [x] Create focus session repository.
- [x] Create reminder repository.
- [x] Create stretch log repository.
- [x] Add default user settings seed.
- [x] Add migration for initial schema.
- [x] Add database helper for timestamps.
- [x] Add repository error handling.

---

# Phase 2: Onboarding Flow

## Frontend TODO

- [x] Create Welcome screen.
- [x] Create Work Style setup screen.
- [x] Create Reminder Preferences setup screen.
- [x] Create Finish Setup screen.
- [x] Add onboarding stepper state.
- [x] Validate selected work style.
- [x] Validate reminder preference values.
- [x] Save onboarding preferences through IPC.
- [x] Redirect user to Dashboard after setup.
- [x] Add first-time user check.
- [x] Skip onboarding if settings already exist.

## Backend TODO

- [x] Create service for getting user settings.
- [x] Create service for updating user settings.
- [x] Create IPC handler: `settings:get`.
- [x] Create IPC handler: `settings:update`.
- [x] Create IPC handler: `settings:isOnboardingComplete`.
- [x] Store onboarding completion status.
- [x] Return default settings if no settings exist yet.
- [x] Validate settings payload before saving.

---

# Phase 3: Dashboard

## Frontend TODO

- [x] Create Dashboard page layout.
- [x] Add focus timer card.
- [x] Add next break reminder card.
- [x] Add next water reminder card.
- [x] Add today work time card.
- [x] Add breaks taken card.
- [x] Add quick action buttons.
- [x] Display current active session state.
- [x] Display next reminder countdown.
- [x] Add empty state for first-time users.
- [x] Add refresh logic after session or reminder updates.

## Backend TODO

- [x] Create dashboard service.
- [x] Create daily summary calculation method.
- [x] Create IPC handler: `dashboard:getToday`.
- [x] Calculate total focus time for today.
- [x] Calculate total breaks taken today.
- [x] Calculate skipped reminders today.
- [x] Calculate completed water reminders today.
- [x] Return current settings with dashboard data.
- [x] Add date filtering helper for today.

---

# Phase 4: Focus Timer

## Frontend TODO

- [x] Create Focus Timer page.
- [x] Add timer countdown component.
- [x] Add duration selector.
- [x] Add Start button.
- [x] Add Pause button.
- [x] Add Resume button.
- [x] Add End Session button.
- [x] Show current session status.
- [x] Show completion message when timer ends.
- [x] Add option to start break after focus session.
- [x] Save completed session through IPC.
- [x] Save cancelled session through IPC.

## Backend TODO

- [x] Create focus session service.
- [x] Create method to start focus session.
- [x] Create method to end focus session.
- [x] Create method to cancel focus session.
- [x] Create IPC handler: `session:start`.
- [x] Create IPC handler: `session:end`.
- [x] Create IPC handler: `session:cancel`.
- [x] Store session start time.
- [x] Store session end time.
- [x] Calculate duration in minutes.
- [x] Save session status as completed, cancelled, or skipped.

---

# Phase 5: Break Reminder

## Frontend TODO

- [x] Create Break Reminder modal.
- [x] Add reminder title and message.
- [x] Add Start Break button.
- [x] Add Snooze 5 min button.
- [x] Add Skip button.
- [x] Create break timer UI.
- [x] Show break completed state.
- [x] Add return to Dashboard option.
- [x] Update daily summary after reminder action.
- [x] Add soft animation for modal opening.

## Backend TODO

- [x] Create reminder service.
- [x] Create break reminder scheduler.
- [x] Create IPC event for break reminder trigger.
- [x] Create IPC handler: `reminder:complete`.
- [x] Create IPC handler: `reminder:snooze`.
- [x] Create IPC handler: `reminder:skip`.
- [x] Store reminder type as `break`.
- [x] Store reminder status.
- [x] Store reminder triggered time.
- [x] Store reminder completed time.
- [x] Add snooze scheduling logic.
- [x] Trigger desktop notification for break reminder.

---

# Phase 6: Break Overlay / Rest Lock Mode

## Frontend TODO

- [x] Create Break Overlay screen.
- [x] Create always-on-top overlay layout design.
- [x] Add large break timer countdown.
- [x] Add cute default GIF, video, or illustration area.
- [x] Add support for selecting default media.
- [x] Add support for previewing custom GIF.
- [x] Add support for previewing custom video.
- [x] Add Start Break button.
- [x] Add Snooze 5 min button.
- [x] Add Emergency Exit button.
- [x] Add Break Complete state.
- [x] Add Continue Working button after break completion.
- [x] Add Open Stretch Guide button after break completion.
- [x] Add overlay mode setting in Settings page.
- [x] Add enable or disable Rest Lock Mode toggle.
- [x] Add friendly break messages.
- [x] Add low-resource fallback using static illustration.
- [x] Ensure overlay works on small laptop screens.
- [x] Ensure overlay text is readable and not visually painful.

## Backend TODO

- [x] Create break overlay service.
- [x] Create separate Electron overlay window.
- [x] Configure overlay as always-on-top.
- [x] Configure overlay as frameless.
- [x] Configure overlay to open when focus session ends.
- [x] Configure overlay to open when break reminder is triggered.
- [x] Add IPC event: `overlay:openBreak`.
- [x] Add IPC event: `overlay:closeBreak`.
- [x] Add IPC handler: `overlay:startBreak`.
- [x] Add IPC handler: `overlay:snoozeBreak`.
- [x] Add IPC handler: `overlay:emergencyExit`.
- [x] Add IPC handler: `overlay:completeBreak`.
- [x] Store overlay mode in settings.
- [x] Store selected overlay media path in settings.
- [x] Validate uploaded media file type.
- [x] Support local GIF file path.
- [x] Support local video file path.
- [x] Add safe fallback if media file is missing.
- [x] Log break status as completed, snoozed, skipped, or emergency_exit.
- [x] Make sure overlay can appear while main app is minimized.
- [x] Prevent multiple overlay windows from opening at the same time.
- [ ] Add emergency exit reason logging as optional future improvement.

## Important UX Rule

Strict blocking should not be enabled by default.

For MVP, prioritize **Focused Break Overlay** instead of aggressive application blocking.

The user should feel guided, not trapped.

---

# Phase 7: Water Reminder

## Frontend TODO

- [x] Create Water Reminder modal or toast.
- [x] Add Done button.
- [x] Add Remind Me Later button.
- [x] Update water reminder count after completion.
- [x] Display next water reminder countdown on Dashboard.
- [x] Add water reminder setting in Settings page.

## Backend TODO

- [x] Add water reminder scheduler.
- [x] Create IPC event for water reminder trigger.
- [x] Store reminder type as `water`.
- [x] Store water reminder status.
- [x] Add remind-me-later logic.
- [x] Trigger desktop notification for water reminder.
- [x] Include completed water reminders in daily summary.

---

# Phase 8: Stretch Guide

## Frontend TODO

- [x] Create Stretch Guide page.
- [x] Create stretch category cards:
  - [x] Neck
  - [x] Shoulder
  - [x] Wrist
  - [x] Eyes
- [x] Create stretch details view.
- [x] Add stretch instruction text.
- [x] Add stretch timer.
- [x] Add Start Stretch button.
- [x] Add Complete Stretch button.
- [x] Add completion message.
- [x] Save completed stretch log through IPC.
- [x] Display completed stretch count in Daily Summary.

## Backend TODO

- [x] Create stretch service.
- [x] Create method to save completed stretch.
- [x] Create method to fetch stretch logs for today.
- [x] Create IPC handler: `stretch:complete`.
- [x] Create IPC handler: `stretch:getToday`.
- [x] Store stretch type.
- [x] Store stretch duration.
- [x] Store completion timestamp.
- [x] Include stretch count in daily summary.

---

# Phase 9: Daily Summary

## Frontend TODO

- [x] Create Daily Summary page.
- [x] Add stat cards:
  - [x] Total focus time
  - [x] Focus sessions
  - [x] Breaks taken
  - [x] Breaks skipped
  - [x] Water reminders completed
  - [x] Stretch sessions completed
- [x] Add simple wellness insight card.
- [x] Add date filter:
  - [x] Today
  - [x] Yesterday
  - [x] Last 7 Days
- [x] Add empty state if no data exists.
- [x] Add refresh button.
- [x] Format durations clearly.

## Backend TODO

- [x] Create summary service.
- [x] Create method to get summary for today.
- [x] Create method to get summary for yesterday.
- [x] Create method to get summary for last 7 days.
- [x] Create IPC handler: `summary:getToday`.
- [x] Create IPC handler: `summary:getYesterday`.
- [x] Create IPC handler: `summary:getLastSevenDays`.
- [x] Calculate completed focus sessions.
- [x] Calculate completed reminders.
- [x] Calculate skipped reminders.
- [x] Generate simple insight message based on user activity.

---

# Phase 10: Settings

## Frontend TODO

- [x] Create Settings page.
- [x] Add focus duration input/select.
- [x] Add break duration input/select.
- [x] Add break interval input/select.
- [x] Add water interval input/select.
- [x] Add enable stretch reminders toggle.
- [x] Add enable desktop notifications toggle.
- [x] Add start app on startup toggle.
- [x] Add Save Settings button.
- [x] Add reset to default button.
- [x] Show success message after saving.
- [x] Show validation errors if needed.

## Backend TODO

- [x] Extend settings service.
- [x] Add settings validation.
- [x] Create IPC handler for resetting settings.
- [x] Save notification preference.
- [x] Save startup preference.
- [x] Integrate startup preference with Electron app settings.
- [x] Apply updated reminder intervals after saving.
- [x] Restart reminder schedulers after settings update.

---

# Phase 11: Desktop Notifications and Tray

## Frontend TODO

- [ ] Add UI state for notification permission status.
- [ ] Show notification disabled warning if needed.
- [ ] Add tray status indicator in Dashboard.
- [ ] Add simple reminder preview in Settings.

## Backend TODO

- [ ] Implement Electron desktop notifications.
- [ ] Add notification click behavior.
- [ ] Open break modal when notification is clicked.
- [ ] Open water modal when notification is clicked.
- [ ] Add tray icon.
- [ ] Add tray menu:
  - [ ] Open App
  - [ ] Start Focus
  - [ ] Take Break
  - [ ] Quit
- [ ] Keep reminders running while app is minimized.
- [ ] Handle app close-to-tray behavior.

---

# Phase 12: UI Polish

## Frontend TODO

- [ ] Apply consistent spacing across pages.
- [ ] Apply consistent card components.
- [ ] Add button variants:
  - [ ] Primary
  - [ ] Secondary
  - [ ] Ghost
  - [ ] Danger
- [ ] Add modal component.
- [ ] Add input component.
- [ ] Add select component.
- [ ] Add toggle component.
- [ ] Add loading state component.
- [ ] Add empty state component.
- [ ] Add responsive layout for small desktop windows.
- [ ] Add calm micro-interactions.
- [ ] Review font sizes.
- [ ] Review color contrast.
- [ ] Remove unnecessary visual clutter.

## Backend TODO

- [ ] Review IPC handler naming.
- [ ] Review service naming.
- [ ] Review repository naming.
- [ ] Add consistent error response format.
- [ ] Add logs for main process errors.
- [ ] Add safe fallback for database errors.
- [ ] Add app version information.
- [ ] Add environment detection for development and production.

---

# Phase 13: Testing and Quality

## Frontend TODO

- [ ] Test onboarding flow.
- [ ] Test dashboard data rendering.
- [ ] Test focus timer controls.
- [ ] Test break modal actions.
- [ ] Test water reminder actions.
- [ ] Test stretch guide completion.
- [ ] Test daily summary page.
- [ ] Test settings form validation.
- [ ] Test app behavior after reload.
- [ ] Test small window layout.
- [ ] Test basic accessibility using keyboard navigation.

## Backend TODO

- [ ] Test SQLite database connection.
- [ ] Test migration runner.
- [ ] Test settings repository.
- [ ] Test focus session repository.
- [ ] Test reminder repository.
- [ ] Test stretch log repository.
- [ ] Test focus session service.
- [ ] Test reminder scheduler.
- [ ] Test summary calculation.
- [ ] Test IPC handlers.
- [ ] Test desktop notifications.
- [ ] Test app behavior when minimized.
- [ ] Test app behavior after restart.

---

# Phase 14: Packaging and Release

## Frontend TODO

- [ ] Finalize app icon.
- [ ] Finalize app name.
- [ ] Finalize empty states.
- [ ] Finalize onboarding copy.
- [ ] Finalize dashboard copy.
- [ ] Finalize settings copy.
- [ ] Review all UI screens before release.

## Backend TODO

- [ ] Configure Electron builder.
- [ ] Configure Windows build.
- [ ] Configure installer settings.
- [ ] Include SQLite database path handling for production.
- [ ] Test production build locally.
- [ ] Test installer.
- [ ] Test uninstall behavior.
- [ ] Add app auto-start support if enabled.
- [ ] Prepare release notes.
- [ ] Create version `v0.1.0`.

---

# Suggested Development Order

1. Project setup
2. SQLite database
3. Settings and onboarding
4. Dashboard
5. Focus timer
6. Break reminder
7. Break overlay / Rest Lock Mode
8. Water reminder
9. Stretch guide
10. Daily summary
11. Settings improvements
12. Notifications and tray
13. UI polish
14. Testing
15. Packaging

---

# MVP Completion Checklist

The MVP is complete when:

## Frontend

- [ ] User can complete onboarding.
- [ ] User can view Dashboard.
- [ ] User can start, pause, resume, and end focus sessions.
- [ ] User can receive and act on break reminders.
- [ ] User can use optional Break Overlay / Rest Lock Mode.
- [ ] User can see a cute GIF, video, or illustration during break time.
- [ ] User can snooze or emergency-exit the break overlay.
- [ ] User can receive and act on water reminders.
- [ ] User can complete stretch guide activities.
- [ ] User can view daily summary.
- [ ] User can update settings.
- [ ] UI looks minimal, clean, and readable.

## Backend

- [ ] SQLite database is working.
- [ ] Migrations are working.
- [ ] Settings are saved locally.
- [ ] Focus sessions are saved locally.
- [ ] Reminder logs are saved locally.
- [ ] Break overlay actions are saved locally.
- [ ] Stretch logs are saved locally.
- [ ] Summary calculations are working.
- [ ] IPC communication is safe and functional.
- [ ] Desktop notifications are working.
- [ ] App can be packaged for Windows.
