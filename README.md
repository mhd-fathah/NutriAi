# 🥗 NutriAI - AI Powered Nutrition Tracking App

NutriAI is a modern AI-powered nutrition tracking web application that helps users analyze meals, track calories, monitor macronutrients, and receive personalized nutrition insights using image recognition powered by Google Gemini AI.

Built with Next.js 15, TypeScript, MongoDB Atlas, NextAuth, Tailwind CSS, and Gemini Vision AI.

---

## 🚀 Features

### 🔐 Authentication

* Email & Password Authentication
* Google Authentication
* Secure session management using NextAuth/Auth.js
* Protected routes
* Auto onboarding for new users

### 👤 User Onboarding

Collects:

* Age
* Gender
* Height
* Weight
* Activity Level

Automatically calculates:

* BMI
* Recommended Goal
* Daily Calories
* Daily Protein
* Daily Carbs
* Daily Fat

---

## 🤖 AI Food Recognition

Upload a food image and NutriAI will:

* Identify food items
* Estimate serving weight
* Calculate calories
* Calculate protein
* Calculate carbohydrates
* Calculate fats
* Calculate sugar

Powered by:

* Google Gemini 2.5 Flash Vision

Example:

```json
{
  "foodName": "Chicken Biryani",
  "estimatedWeight": 450,
  "calories": 780,
  "protein": 35,
  "carbs": 85,
  "fat": 25,
  "sugar": 5
}
```

---

## 📊 Dashboard Analytics

Dashboard includes:

### Daily Progress

* Daily calorie target
* Progress ring
* Remaining calories

### Nutrition Tracking

* Calories
* Protein
* Carbohydrates
* Fat
* Sugar

### AI Nutrition Coach

Provides personalized nutrition recommendations based on:

* Daily target
* Consumed meals
* Nutrition intake

### Weekly Analytics

* Calories Trend Chart
* Macronutrient Distribution
* Weekly Nutrition Summary

Built using:

* Recharts

---

## 📚 Meal History

Track nutrition history by:

### Daily

View today's meals

### Weekly

View weekly nutrition trends

### Monthly

View monthly nutrition performance

Includes:

* Meal images
* Meal types
* Calories
* Protein
* Carbs
* Fat
* Consumption timestamps

---

## 🌗 Theme Support

### Light Mode

Clean and modern health-focused design.

### Dark Mode

Fully optimized dark experience with:

* Dark surfaces
* Dark analytics
* Dark forms
* Dark navigation
* Dark charts

Supports:

* Light
* Dark
* System Theme

---

## 📱 Progressive Web App (PWA)

NutriAI can be installed as a mobile application.

Features:

* Home screen installation
* Offline support
* Splash screen
* App icons
* Full-screen experience
* Mobile-friendly design

Supported on:

* Android
* iOS
* Desktop

---

## 🏗️ Architecture

The project follows Clean Architecture principles.

```text
src
│
├── app
│
├── actions
│
├── components
│   ├── analytics
│   ├── auth
│   ├── dashboard
│   ├── upload
│   └── shared
│
├── lib
│   ├── calculations
│   ├── mongodb
│   ├── gemini
│   └── validations
│
├── models
│
├── types
│
├── constants
│
└── utils
```

---

## 🛠️ Tech Stack

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* React Hook Form
* Zod
* Recharts
* Lucide React

### Backend

* Next.js Server Actions
* MongoDB Atlas
* Mongoose

### Authentication

* NextAuth/Auth.js
* Google OAuth
* Credentials Authentication

### AI

* Google Gemini 2.5 Flash Vision

### Deployment

* Vercel

---

## 🧮 Nutrition Calculations

### BMI Formula

```text
BMI = weight / (height / 100)^2
```

### BMI Categories

| BMI         | Category    |
| ----------- | ----------- |
| <18.5       | Underweight |
| 18.5 - 24.9 | Normal      |
| 25 - 29.9   | Overweight  |
| 30+         | Obese       |

---

### Goal Recommendation

```text
BMI < 18.5
→ Gain Weight

BMI 18.5 - 24.9
→ Maintain Weight

BMI > 25
→ Lose Weight
```

---

### Daily Calories

Uses:

Mifflin-St Jeor Formula

#### Male

```text
BMR =
10 × weight +
6.25 × height -
5 × age +
5
```

#### Female

```text
BMR =
10 × weight +
6.25 × height -
5 × age -
161
```

Then multiplied by activity level.

---

## ⚙️ Environment Variables

Create:

```bash
.env.local
```

Add:

```env
# MongoDB Atlas
MONGODB_URI=

# NextAuth
NEXTAUTH_SECRET=
AUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Gemini AI (https://aistudio.google.com/apikey)
GEMINI_API_KEY=

# Cloudinary (https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/mhd-fathah/NutriAi.git
```

```bash
cd nutriai
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create:

```bash
.env.local
```

### Run Development Server

```bash
npm run dev
```

Application:

```text
http://localhost:3000
```

---

## 📦 Build

```bash
npm run build
```

```bash
npm start
```

---

## 🌍 Deployment

Recommended:

### Vercel

```bash
vercel
```

Configure:

* MongoDB Atlas
* Gemini API Key
* Google OAuth
* Cloudinary

Environment variables in Vercel Dashboard.

---

## 👨‍💻 Author

Muhammed Fathah

Full Stack Developer

* Next.js
* TypeScript
* MongoDB
* AI Integrations
* Clean Architecture

---

## 📄 License

This project is built for educational and portfolio purposes.

---

### ⭐ If you found this project useful, please consider starring the repository.
