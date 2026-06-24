# 🥗 NutriAI

AI-Powered Nutrition Tracking & Food Analysis Platform

NutriAI is a modern full-stack nutrition tracking application that helps users analyze meals using AI, track daily nutrition, monitor calorie goals, and receive personalized nutrition recommendations.

Built with a scalable architecture using Next.js, NestJS, MongoDB, Gemini Vision AI, and Clean Architecture principles.

---

# 🚀 Features

## Authentication

* Email & Password Authentication
* Google Authentication
* Secure JWT Authentication
* Protected Routes
* Session Management

---

## User Onboarding

Collects:

* Name
* Age
* Gender
* Height
* Weight
* Activity Level

Automatically calculates:

* BMI
* Nutrition Goal
* Daily Calories
* Daily Protein
* Daily Carbohydrates
* Daily Fat

---

## AI Food Recognition

Upload a food image and NutriAI will:

* Detect food items
* Estimate serving size
* Estimate weight
* Calculate calories
* Calculate protein
* Calculate carbohydrates
* Calculate fats
* Calculate sugar

Powered by:

* Google Gemini Vision AI

---

## AI Nutrition Coach

Provides personalized recommendations based on:

* Daily calorie target
* Consumed calories
* Protein intake
* Macronutrient balance
* User goal

Examples:

* Increase protein intake
* Reduce excess calories
* Improve meal balance
* Hydration reminders

---

## Dashboard

Features:

### Daily Progress

* Calorie Progress Ring
* Remaining Calories
* Daily Targets

### Nutrition Tracking

* Calories
* Protein
* Carbohydrates
* Fat
* Sugar

### AI Insights

* Personalized Nutrition Tips
* Goal Tracking
* Daily Recommendations

### Weekly Analytics

* Calories Trend Chart
* Macronutrient Distribution
* Weekly Nutrition Overview

---

## Meal Upload

Users can:

* Select meal type
* Upload food image
* Analyze meal using AI
* Review AI results
* Save meal
* Discard meal

Supported meal types:

* Breakfast
* Lunch
* Dinner
* Snacks

---

## Meal History

Track nutrition history by:

### Daily

View meals consumed today.

### Weekly

View nutrition trends for the current week.

### Monthly

View monthly nutrition performance.

---

## Dark Mode

Supports:

* Light Mode
* Dark Mode
* System Theme

Fully optimized dark experience.

---

## Progressive Web App (PWA)

Installable on:

* Android
* iPhone
* Desktop

Features:

* Offline support
* Home screen installation
* Splash screen
* App-like experience

---

# 🏗 Architecture

The project follows:

* Clean Architecture
* Repository Pattern
* SOLID Principles

---

## Backend Flow

```text
Controller
↓
Use Case / Service
↓
Repository
↓
MongoDB
```

---

## AI Flow

```text
Food Image
↓
Gemini Vision
↓
Food Detection
↓
Nutrition Analysis
↓
Confidence Scoring
↓
Review Screen
↓
User Confirmation
↓
Database Save
```

---

# 📂 Project Structure

## Frontend

```text
nutriai-client/

src
├── app
├── components
├── services
├── hooks
├── lib
├── types
├── utils
├── constants
└── providers
```

---

## Backend

```text
nutriai-server/

src

├── modules
│   ├── auth
│   ├── users
│   ├── meals
│   ├── analytics
│   └── ai
│
├── repositories
├── services
├── controllers
├── dto
├── schemas
├── interfaces
├── common
└── config
```

---

# 🛠 Tech Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* React Hook Form
* Zod
* Recharts
* Next Themes
* Axios

---

## Backend

* NestJS
* TypeScript
* JWT Authentication
* Repository Pattern
* Clean Architecture

---

## Database

* MongoDB Atlas
* Mongoose

---

## AI

* Google Gemini Vision

---

## Storage

* Cloudinary

---

## Deployment

### Frontend

* Vercel

### Backend

* Render

---

# 🧮 Nutrition Calculations

## BMI Formula

```text
BMI = weight / (height / 100)^2
```

---

## BMI Categories

| BMI         | Category    |
| ----------- | ----------- |
| <18.5       | Underweight |
| 18.5 - 24.9 | Normal      |
| 25 - 29.9   | Overweight  |
| 30+         | Obese       |

---

## Goal Recommendation

### Underweight

Gain Weight

### Normal

Maintain Weight

### Overweight

Lose Weight

---

## Daily Calories

Calculated using:

Mifflin-St Jeor Formula

### Male

```text
10 × weight +
6.25 × height -
5 × age +
5
```

### Female

```text
10 × weight +
6.25 × height -
5 × age -
161
```

Adjusted using activity level.

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected Routes
* Input Validation
* DTO Validation
* Rate Limiting
* Secure API Communication

---

# ⚡ Performance Optimizations

* Image Compression Before Upload
* Gemini Response Caching
* MongoDB Indexing
* Aggregation Pipelines
* React Memoization
* Lazy Loading
* Optimized API Calls
* PWA Support

---

# 🌟 Key Improvements

### AI Analysis Review

Meals are not saved automatically.

Users can:

* Save Meal
* Discard Meal

before storing data.

---

### AI Confidence Score

Each analysis includes:

* Confidence Rating
* Provider Information
* Nutrition Validation

---

### Smart Fallback System

If AI is unavailable:

* Rule-based nutrition estimation
* Graceful degradation

---

# 📦 Installation

## Frontend

```bash
git clone <repository-url>

cd nutriai-client

npm install

npm run dev
```

---

## Backend

```bash
cd nutriai-server

npm install

npm run start:dev
```

---

# 🔧 Environment Variables

## Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
```

---

## Backend

```env
MONGODB_URI=

JWT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---


# 👨‍💻 Author

Muhammed Fathah

Full Stack Developer

Tech Stack:

* Next.js
* NestJS
* TypeScript
* MongoDB
* AI Integrations
* Clean Architecture

---

# 📄 License

This project is created for educational, portfolio, and technical evaluation purposes.

---

⭐ If you found this project useful, consider giving it a star.
