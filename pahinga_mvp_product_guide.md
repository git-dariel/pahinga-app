# Pahinga MVP Product Guide

## Project Overview

**Pahinga** is a minimal desktop wellness and productivity application for people who spend long hours using a laptop or computer.

The main goal is to help users build healthier working habits through simple break reminders, focus sessions, water reminders, and daily summaries without making the app feel complicated or distracting.

## Target Users

- Software developers
- Students
- Freelancers
- Office workers
- Designers, editors, and other computer-heavy workers

## Core Problem

Many computer users work for long hours without noticing how much time has passed. This often leads to eye strain, neck pain, shoulder pain, wrist discomfort, fatigue, and burnout.

Pahinga solves this by giving lightweight, non-annoying reminders and simple tracking that helps users rest, hydrate, and stay aware of their work patterns.

---

# MVP Features

## 1. Simple Onboarding

### Purpose

Introduce the app quickly and let users configure basic preferences in less than one minute.

### User Flow

#### Step 1: Welcome Screen

When the user opens the app for the first time, they see a clean welcome screen.

**Screen content:**

- App logo
- Short headline: `Take better care of yourself while working`
- Short description: `Pahinga helps you take breaks, drink water, and stay focused during long computer sessions.`
- Primary button: `Get Started`

#### Step 2: Work Style Setup

The user selects their usual work style.

**Options:**

- Developer / Programmer
- Student
- Office Worker
- Freelancer
- Designer / Editor
- Other

This selection can later be used to personalize reminder suggestions.

#### Step 3: Reminder Preferences

The user chooses default reminder intervals.

**Fields:**

- Break reminder interval: 25, 45, or 60 minutes
- Water reminder interval: 60, 90, or 120 minutes
- Enable stretch reminders: Yes / No
- Enable eye rest reminders: Yes / No

#### Step 4: Finish Setup

The app shows a short confirmation screen.

**Screen content:**

- `You're all set.`
- Short message: `Pahinga will now help you build healthier work habits.`
- Button: `Go to Dashboard`

---

## 2. Dashboard

### Purpose

Give the user a simple overview of their current work session, next reminder, and today's progress.

### User Flow

#### Step 1: User Opens the App

After onboarding, the user lands on the Dashboard.

#### Step 2: Dashboard Shows Current Status

**Main sections:**

- Current focus timer
- Next break reminder
- Next water reminder
- Today's total work time
- Number of breaks taken
- Quick action buttons

#### Step 3: User Can Start or Pause Work Session

The user can click:

- `Start Focus`
- `Pause`
- `Stop Session`

#### Step 4: User Receives Reminder Status

Example:

`Next break in 18 minutes`

`Next water reminder in 42 minutes`

---

## 3. Focus Timer

### Purpose

Help the user work in focused sessions while keeping breaks intentional.

### User Flow

#### Step 1: Start Focus Session

From the Dashboard, the user clicks `Start Focus`.

#### Step 2: Timer Starts

The timer begins counting down based on the selected duration.

**Default options:**

- 25 minutes
- 45 minutes
- 60 minutes
- Custom duration

#### Step 3: Focus Mode Screen

The app shows a simple focus screen.

**Screen content:**

- Timer countdown
- Current session label
- Button: `Pause`
- Button: `End Session`
- Small text: `Your next break will start after this session.`

#### Step 4: Focus Session Ends

When the timer ends, the app shows a break notification.

**Notification message:**

`Focus session complete. Take a short break.`

#### Step 5: User Chooses Next Action

Options:

- `Start 5-minute break`
- `Skip break`
- `Start another focus session`

---

## 4. Break Reminder

### Purpose

Remind users to rest their body and avoid sitting too long.

### User Flow

#### Step 1: Reminder Time Is Reached

After the selected interval, the app sends a desktop notification.

**Notification message:**

`Time for a short break. Stand up, stretch, and rest your eyes.`

#### Step 2: Break Modal Appears

If the user clicks the notification, a small modal opens.

**Modal content:**

- Suggested break type
- Duration
- Simple instruction
- Buttons:
  - `Start Break`
  - `Snooze 5 min`
  - `Skip`

#### Step 3: User Starts Break

The break timer starts.

**Default break duration:**

- 5 minutes

#### Step 4: Break Ends

The app shows:

`Break complete. Ready to continue?`

Options:

- `Start Focus`
- `Back to Dashboard`

---

## 5. Break Overlay / Rest Lock Mode

### Purpose

Create a stronger break experience for users who want the app to actively stop them from continuing work during break time.

This feature shows a full-screen or always-on-top break overlay when a focus session ends or when the break reminder time is reached.

The goal is not to punish the user. The goal is to make resting easier by reducing the temptation to continue working.

### Recommended Behavior

For MVP, this should be **optional** and controlled from Settings.

Recommended modes:

| Mode                  | Behavior                                                                        |
| --------------------- | ------------------------------------------------------------------------------- |
| Soft Reminder         | Shows a normal notification and small modal only                                |
| Focused Break Overlay | Shows an always-on-top break screen with timer                                  |
| Strict Rest Lock      | Shows a full-screen overlay and discourages switching apps until the break ends |

For the first MVP, the safest version is **Focused Break Overlay**.

### Why Not Force It by Default

Some users may be in a meeting, presenting, uploading files, or doing urgent work. If the app blocks them without control, it can become frustrating.

The best UX is:

- Let the user enable or disable Rest Lock Mode.
- Let the user choose strictness level.
- Always provide emergency exit.
- Allow snooze if needed.
- Make the overlay calm and friendly.

### User Flow

#### Step 1: User Starts Focus Session

The user clicks `Start Focus` from the Dashboard or Focus Timer page.

#### Step 2: Focus Session Ends

When the timer reaches zero, Pahinga prepares the break experience based on the user's selected mode.

#### Step 3: Break Overlay Appears

If Rest Lock Mode is enabled, an overlay appears on top of the user's screen.

**Overlay content:**

- Cute illustration, GIF, or short video
- Break timer countdown
- Friendly message
- Suggested action
- Buttons:
  - `Start Break`
  - `Snooze 5 min`
  - `Emergency Exit`

Example message:

`Time to rest. Your eyes and shoulders need a short break.`

#### Step 4: User Starts Break

The overlay starts the break timer.

Example:

`Rest for 5 minutes`

During the timer, the overlay stays visible and encourages the user not to return to work yet.

#### Step 5: Optional GIF or Video Plays

The overlay can show a calming GIF, cute mascot animation, breathing animation, stretch demo, or short video.

Recommended media types:

- Local GIF
- Local MP4
- Lightweight animation
- Lottie animation
- Static illustration for low-resource mode

#### Step 6: Break Ends

When the break timer ends, the overlay changes state.

Message:

`Break complete. Nice work taking care of yourself.`

Options:

- `Continue Working`
- `Start Another Focus Session`
- `Open Stretch Guide`

#### Step 7: App Logs the Break

The app saves the break result as:

- completed
- snoozed
- skipped
- emergency_exit

### Overlay UX Rules

- The overlay should be visually calm.
- Do not use aggressive warnings.
- Avoid loud sounds by default.
- Keep the exit button available but less emphasized.
- Do not make the user feel trapped.
- Show remaining time clearly.
- Use cute visuals to make the break feel positive.
- The overlay should work even if the app is minimized.

### Suggested Overlay Layout

```text
Full Screen / Always-on-top Overlay

 ------------------------------------------------
|                                                |
|              Cute GIF / Animation              |
|                                                |
|       Time to rest your eyes and body.          |
|                                                |
|                  04:59                         |
|                                                |
|       [Snooze 5 min] [Emergency Exit]           |
|                                                |
 ------------------------------------------------
```

### Settings for This Feature

Add these settings:

- Enable Rest Lock Mode
- Overlay mode:
  - Soft Reminder
  - Focused Break Overlay
  - Strict Rest Lock
- Break overlay media:
  - Default animation
  - Custom GIF
  - Custom video
- Allow emergency exit:
  - Yes / No
- Allow snooze:
  - Yes / No

### Recommended MVP Scope

For the MVP, implement:

- Always-on-top overlay window
- Break timer
- Default cute GIF or illustration
- Snooze button
- Emergency exit button
- Completed break logging
- Setting to enable or disable Rest Lock Mode

Strict app blocking can be added later because it is more sensitive and can create bad user experience if implemented too aggressively.

---

## 6. Water Reminder

### Purpose

Help users remember to hydrate during long work sessions.

### User Flow

#### Step 1: Water Reminder Time Is Reached

The app sends a soft reminder.

**Notification message:**

`Drink some water. Stay hydrated while working.`

#### Step 2: User Marks Reminder as Done

Options:

- `Done`
- `Remind me later`

#### Step 3: App Logs the Action

If the user clicks `Done`, the reminder is counted in today's summary.

---

## 7. Stretch Guide

### Purpose

Provide quick and simple stretch instructions for common computer-related discomfort.

### MVP Stretch Types

- Neck stretch
- Shoulder roll
- Wrist rotation
- Eye rest using the 20-20-20 rule

### User Flow

#### Step 1: User Opens Stretch Guide

The user clicks `Stretch Guide` from the sidebar or Dashboard.

#### Step 2: User Selects Stretch Type

The app shows simple cards:

- Neck
- Shoulder
- Wrist
- Eyes

#### Step 3: User Opens a Stretch

The selected stretch displays:

- Title
- Short instruction
- Recommended duration
- Start button

#### Step 4: User Starts Stretch Timer

The app starts a timer, usually 30 seconds to 1 minute.

#### Step 5: Stretch Completed

The app shows:

`Nice. Stretch completed.`

The completion is added to the daily summary.

---

## 8. Daily Summary

### Purpose

Give the user a simple review of their work and wellness habits for the day.

### User Flow

#### Step 1: User Opens Summary Page

The user clicks `Daily Summary` from the sidebar.

#### Step 2: App Shows Today's Stats

**Data shown:**

- Total focus time
- Number of focus sessions
- Breaks taken
- Breaks skipped
- Water reminders completed
- Stretch sessions completed

#### Step 3: App Shows Simple Insight

Example:

`You worked for 5 hours today and took 4 breaks. Good job keeping a healthier work rhythm.`

Or:

`You worked for 4 hours but skipped most breaks. Try taking short breaks tomorrow to avoid fatigue.`

#### Step 4: User Can Reset or View Previous Days

For MVP, previous history can be basic.

Options:

- `Today`
- `Yesterday`
- `Last 7 Days`

---

## 9. Settings

### Purpose

Allow the user to customize reminders without making the app complicated.

### User Flow

#### Step 1: User Opens Settings

The user clicks `Settings` from the sidebar.

#### Step 2: User Updates Preferences

**Settings fields:**

- Focus duration
- Break duration
- Break reminder interval
- Water reminder interval
- Enable / disable stretch reminders
- Enable / disable desktop notifications
- Start app on system startup

#### Step 3: User Saves Changes

The user clicks `Save Settings`.

#### Step 4: App Confirms Changes

Message:

`Settings saved successfully.`

---

# Recommended App Structure

## Main Navigation

Use a simple sidebar layout.

### Sidebar Items

1. Dashboard
2. Focus Timer
3. Stretch Guide
4. Daily Summary
5. Settings

The Break Overlay does not need a sidebar page in the MVP. It should appear automatically when a break starts or when a focus session ends.

## First-Time App Flow

```text
Open App
  -> Welcome Screen
  -> Work Style Setup
  -> Reminder Preferences
  -> Finish Setup
  -> Dashboard
```

## Daily User Flow

```text
Open App
  -> Dashboard
  -> Start Focus
  -> Focus Session Ends
  -> Break Overlay Appears
  -> Take Break, Snooze, or Emergency Exit
  -> Continue Focus
  -> Receive Water Reminder
  -> View Daily Summary
```

---

# Recommended Design Pattern

## Recommended Pattern: Service-Oriented Architecture with Repository Pattern

This pattern fits well because the app has local data, business logic, and UI behavior that should be separated clearly.

### Why This Pattern Fits

- Electron has a main process and renderer process.
- React should focus only on UI.
- SQLite operations should not be mixed directly with React components.
- Reminder logic should be reusable and testable.
- The app may grow later with features like app usage tracking, AI insights, or cloud sync.

## Suggested Layers

```text
src/
  main/
    electron/
    preload/
    services/
    database/
    repositories/

  renderer/
    components/
    pages/
    hooks/
    services/
    stores/
    types/
```

## Layer Responsibilities

### Renderer Layer

Responsible for the user interface.

Examples:

- Dashboard page
- Focus timer page
- Settings page
- Buttons, modals, cards
- UI state

### Service Layer

Responsible for business logic.

Examples:

- Start focus session
- Stop focus session
- Calculate daily summary
- Trigger reminder flow
- Validate settings

### Repository Layer

Responsible for database access.

Examples:

- Save session logs
- Fetch today's summary
- Update user settings
- Store reminder history

### Database Layer

Responsible for SQLite configuration and migrations.

Examples:

- Create tables
- Run migration scripts
- Manage SQLite connection

### IPC Layer

Responsible for safe communication between Electron main process and React renderer.

Examples:

- `settings:get`
- `settings:update`
- `session:start`
- `session:end`
- `summary:getToday`

---

# Suggested Local Database Tables

## users_settings

Stores user preferences.

| Field                 | Purpose                         |
| --------------------- | ------------------------------- |
| id                    | Unique settings record          |
| work_style            | User work type                  |
| focus_duration        | Default focus duration          |
| break_duration        | Default break duration          |
| break_interval        | Break reminder interval         |
| water_interval        | Water reminder interval         |
| notifications_enabled | Enable or disable notifications |
| created_at            | Record creation date            |
| updated_at            | Last update date                |

## focus_sessions

Stores focus session logs.

| Field            | Purpose                       |
| ---------------- | ----------------------------- |
| id               | Unique session ID             |
| started_at       | Start time                    |
| ended_at         | End time                      |
| duration_minutes | Total session duration        |
| status           | completed, skipped, cancelled |

## reminders

Stores reminder logs.

| Field        | Purpose                         |
| ------------ | ------------------------------- |
| id           | Unique reminder ID              |
| type         | break, water, stretch, eye_rest |
| triggered_at | Time reminder appeared          |
| completed_at | Time user completed it          |
| status       | completed, snoozed, skipped     |

## stretch_logs

Stores completed stretch activities.

| Field            | Purpose                     |
| ---------------- | --------------------------- |
| id               | Unique stretch log ID       |
| stretch_type     | neck, shoulder, wrist, eyes |
| duration_seconds | Stretch duration            |
| completed_at     | Completion time             |

---

# UI/UX Direction

## Design Goal

The app should feel calm, minimal, and easy to use. It should not look like a heavy productivity dashboard. The user should understand the app within the first minute.

## UX Principles

- Use fewer buttons per screen.
- Use clear labels.
- Avoid too many charts in the MVP.
- Use friendly but direct messages.
- Make reminders soft, not annoying.
- Let users snooze or skip reminders.
- Keep settings simple.
- Make the dashboard the main control center.

---

# Recommended Font Style

## Primary Font

**Inter**

Why:

- Clean and modern
- Very readable
- Works well for dashboards
- Commonly used in SaaS and productivity apps

## Alternative Fonts

- Manrope
- Geist
- Plus Jakarta Sans
- IBM Plex Sans

## Font Usage

| Element       |   Font Size | Weight |
| ------------- | ----------: | -----: |
| Page title    | 24px - 32px |    700 |
| Section title | 18px - 20px |    600 |
| Body text     | 14px - 16px |    400 |
| Small labels  | 12px - 13px |    500 |
| Button text   | 14px - 15px |    600 |

---

# Recommended Color Palette

## Palette Name: Calm Slate

This color palette is minimal, modern, and not painful to the eyes.

| Purpose        | Color     | Usage                          |
| -------------- | --------- | ------------------------------ |
| Background     | `#F8FAFC` | Main app background            |
| Surface        | `#FFFFFF` | Cards and panels               |
| Primary        | `#2563EB` | Main buttons and active states |
| Primary Soft   | `#DBEAFE` | Highlight backgrounds          |
| Text Primary   | `#0F172A` | Main text                      |
| Text Secondary | `#64748B` | Supporting text                |
| Border         | `#E2E8F0` | Card and input borders         |
| Success        | `#16A34A` | Completed actions              |
| Warning        | `#F59E0B` | Skipped breaks or alerts       |
| Danger         | `#DC2626` | Errors only                    |

## Dark Mode Optional Palette

| Purpose        | Color     |
| -------------- | --------- |
| Background     | `#0F172A` |
| Surface        | `#1E293B` |
| Primary        | `#60A5FA` |
| Text Primary   | `#F8FAFC` |
| Text Secondary | `#CBD5E1` |
| Border         | `#334155` |

## Tailwind Theme Suggestion

```ts
colors: {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  primary: "#2563EB",
  primarySoft: "#DBEAFE",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
}
```

---

# Suggested MVP Screens

## 1. Welcome Screen

Simple centered card with logo, headline, short description, and `Get Started` button.

## 2. Setup Screen

A simple multi-step setup wizard.

## 3. Dashboard Screen

Main app home.

Recommended layout:

- Left sidebar
- Top greeting
- Large focus timer card
- Next reminder cards
- Daily progress card

## 4. Focus Timer Screen

Large timer with minimal controls.

## 5. Break Modal

Small modal with reminder message and action buttons.

## 7. Stretch Guide Screen

Grid of stretch cards.

## 8. Daily Summary Screen

Simple stat cards and one insight message.

## 9. Settings Screen

Basic form with reminder preferences.

---

# MVP Success Criteria

The MVP is successful if the user can:

- Complete onboarding in less than one minute.
- Start a focus session easily.
- Receive break and water reminders.
- Use optional Break Overlay / Rest Lock Mode.
- Take, snooze, complete, or emergency-exit break reminders.
- Complete a stretch guide.
- View a simple daily summary.
- Change reminder settings anytime.

---

# Future Features After MVP

- App usage tracking
- Weekly wellness report
- AI-generated wellness insights
- Posture camera detection
- Cloud sync
- Account system
- Custom reminders
- Tray icon quick actions
- Gamification and streaks
