# Pawxy

Pawxy is an AI-first productivity companion designed to reduce mental overload and help users stay focused throughout their workday.

Instead of managing endless to-do lists, Pawxy combines intelligent task planning, an always-on-top workspace, and a friendly AI secretary cat to guide users from brain dump to focused execution.

By integrating generative AI with modern browser capabilities such as Document Picture-in-Picture, Pawxy creates a calm and distraction-free workflow that stays with users wherever they work.

---

# Overview

Traditional productivity applications require users to constantly switch between planning and working.

Pawxy solves this by introducing an intelligent desktop companion that remains available at all times.

Users begin by dumping everything on their mind without worrying about structure. Pawxy then uses AI to organize, clarify, and break complex goals into actionable tasks before helping users execute them through a persistent Picture-in-Picture workspace.

Rather than becoming another task management application, Pawxy acts as an **AI Productivity Companion** that supports users throughout their entire work session.

---

# Features

## AI Brain Dump

* Capture thoughts without structure
* AI-powered task breakdown
* Automatic time estimation
* AI clarification for ambiguous tasks
* Intelligent task organization

---

## Smart Planning

* Drag-and-drop Kanban workflow
* Automatic timeline generation
* Dynamic task scheduling
* Break management
* Task prioritization

---

## Focus Workspace

* Always-on-top Picture-in-Picture window
* Floating task timer
* Quick task controls
* Universal quick capture
* Real-time synchronization
* Current task & subtask tracking

---

## AI Secretary Companion

* Interactive secretary cat (Meowmy)
* Context-aware mascot reactions
* Idle, typing, focused and celebration states
* Friendly productivity companion
* Micro-interactions that encourage focus

---

## Productivity Analytics

* Focus time tracking
* Break tracking
* AFK detection
* Automatic timer pause
* Daily productivity statistics
* AI-generated daily review

---

# Tech Stack

## Frontend

* Next.js (App Router)
* React 19
* TypeScript
* Tailwind CSS
* Framer Motion

## State Management

* Zustand
* Local Storage Persistence

## AI

* Gemini AI

## Backend

* Supabase
* PostgreSQL

## Browser APIs

* Document Picture-in-Picture API
* Idle Detection API

---

# Architecture Highlights

## AI Planning Workflow

1. Brain Dump
2. AI analyzes the user's thoughts
3. Request clarification if necessary
4. Break complex tasks into subtasks
5. Estimate completion time
6. Generate an executable task list

---

## Smart Daily Workflow

Brain Dump

↓

AI Planning

↓

Control Room

↓

Focus Mode

↓

End-of-Day Review

Instead of asking users to manually organize everything, Pawxy continuously assists throughout each stage of the productivity cycle.

---

## Picture-in-Picture Workspace

Pawxy leverages the **Document Picture-in-Picture API** to create a persistent floating workspace that remains visible while users work in other applications.

Unlike traditional browser tabs, the PiP workspace allows users to:

* Monitor current tasks
* Control timers
* Capture ideas instantly
* Stay focused without context switching

---

## AI Task Breakdown

Rather than generating generic to-do lists, Pawxy transforms large and ambiguous goals into manageable action plans.

When tasks lack sufficient detail, Gemini AI asks follow-up questions before generating subtasks, resulting in more accurate and practical execution plans.

---

## Focus Tracking

Using the Idle Detection API together with manual activity monitoring, Pawxy automatically detects when users leave their desk.

The application pauses timers, records AFK duration, and generates accurate productivity statistics without requiring manual input.

---

# Key Problem Solved

Most productivity applications answer the question:

> "What do I need to do today?"

Pawxy answers a more important question:

> **"How can I actually stay focused and finish my work?"**

By combining AI planning, persistent Picture-in-Picture workspaces, intelligent focus tracking, and a friendly desktop companion, Pawxy helps users transform overwhelming thoughts into meaningful progress.

---

# Future Roadmap

* Google Calendar Integration
* Cross-device Synchronization
* AI Weekly Reports
* Smart Rescheduling
* AI Memory & Personal Context
* Voice Commands
* Desktop Notifications
* Team Collaboration
* Mobile Companion App
* Browser Extension

---

# Author

**Achirawat Wattanaworapant**

Full-Stack Software Engineer
