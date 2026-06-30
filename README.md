<h1 align="center">CivicGuard</h1>

<p align="center">
  <strong>Empowering Citizens to Build Better Cities, Together</strong>
</p>

<p align="center">
  <img src="./assets/banner.png" alt="CivicGuard Banner" width="600"/>
</p>

<br/>

<p align="center">
  <a href="https://civicguard-frontend-786320252434.asia-south1.run.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-%F0%9F%9A%80-blue?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

---

## Problem Statement

Communities frequently face issues such as potholes, water leakages, damaged streetlights, waste management concerns, and public infrastructure challenges. Reporting these issues is often fragmented, difficult to track, and lacks transparency.

## Solution Overview

CivicGuard is a modern, crowdsourced civic infrastructure assessment platform. It bridges the gap between citizens and city departments by allowing users to instantly report, verify, and track public issues like potholes, broken streetlights, or waste dumps. 

Using **Google Gemini AI**, the platform automatically assesses uploaded images to filter out spam, categorize the problem, and estimate severity. Validated issues are mapped in real-time, and a community-driven verification system ensures only legitimate, high-priority issues are escalated to city officials. A built-in gamification system rewards users with points and badges, encouraging continuous civic engagement.

---

## Key Features

*   **AI-Powered Issue Reporting:** Upload a photo of an infrastructure issue, and our Gemini AI integration automatically analyzes the image, extracts the category (e.g., "pothole", "streetlight"), and assigns a severity score while filtering out spam.
*   **Interactive Live Map:** A real-time, responsive map interface (powered by Mapbox/MapLibre) displaying all reported issues in the community with color-coded severity markers.
*   **Community Feed & Verification:** A social feed where citizens can view, upvote, and verify issues reported by others. Issues that receive enough community verifications are automatically promoted to "verified" status.
*   **City Department Dashboard:** A dedicated view for city officials to track metrics, prioritize high-severity infrastructure problems, and manage repair workflows efficiently.
*   **Analytics Dashboard:** Visualized data insights using Recharts to track the most common types of issues, resolution rates, and geographical hotspots.
*   **Gamification & Leaderboards:** Citizens earn civic points for reporting and verifying real issues, unlocking badges and climbing the community leaderboard (e.g., "Civic Hero").
*   **Secure Authentication & Profiles:** Passwordless or email-based login secured by Firebase Auth, with personalized user profiles to track past reports and total impact.

---

## Architecture Flow

The application is built using a modern decoupled architecture, combining a React/Vite frontend hosted on Google Cloud Run with Firebase backend services and Gemini AI for intelligent processing.

```mermaid
flowchart TD
    User([Citizen / City Official]) -->|Interacts with| Browser[Web Browser]
    Browser --> ReactApp[React App / Vite]
    
    subgraph Frontend [Cloud Run / Docker Hosting]
        ReactApp
        Mapbox[Mapbox / MapLibre]
        Tailwind[Tailwind CSS]
    end
    
    ReactApp -->|Authentication| FirebaseAuth[Firebase Auth]
    ReactApp -->|Upload Image Evidence| FirebaseStorage[(Firebase Storage)]
    ReactApp -->|Read/Write Issue Data| Firestore[(Firestore DB)]
    
    subgraph Backend Services [Firebase / Google Cloud]
        FirebaseAuth
        FirebaseStorage
        Firestore
        CloudFunctions[Cloud Functions / Express Backend]
        GeminiAPI[Google Gemini AI API]
    end
    
    Firestore -->|Triggers| CloudFunctions
    ReactApp -->|REST API Calls| CloudFunctions
    CloudFunctions -->|Analyzes Image + Prompt| GeminiAPI
    GeminiAPI -->|Returns JSON Assessment| CloudFunctions
```

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react) | Frontend UI Library |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | Fast Frontend Build Tool |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Utility-first CSS Styling |
| ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) | Auth, Firestore Database, and Storage |
| ![Google Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-4285F4?style=flat&logo=google-cloud&logoColor=white) | Containerized Frontend & Express Backend Hosting |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) | Containerization for consistent environments |
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) | Express API & Cloud Functions Environment |
| ![Gemini API](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=googlebard&logoColor=white) | AI Image Analysis & Spam Filtering |
| ![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=flat&logo=mapbox&logoColor=white) | Interactive Map Components (via MapLibre) |

---

## License

![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Made with love ❤️ for VIbe2Ship hackathon by Tushar
</p>
