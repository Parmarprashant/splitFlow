# SplitFlow 💸

> **Effortless Expense Sharing, Real-Time Group Balances & Smart UPI Settlements**

[![Backend Status](https://img.shields.io/badge/Render-Live_Cloud_API-46E3B7?style=flat-square&logo=render&logoColor=white)](https://splitflow-wn0x.onrender.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-green?style=flat-square&logo=mongodb&logoColor=white)](https://cloud.mongodb.com/)
[![Expo](https://img.shields.io/badge/Mobile-Expo_SDK_58-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)

- **🌐 Live Production Backend**: [`https://splitflow-wn0x.onrender.com/`](https://splitflow-wn0x.onrender.com/)
- **📡 Base API Endpoint**: [`https://splitflow-wn0x.onrender.com/api`](https://splitflow-wn0x.onrender.com/api)

SplitFlow is a full-stack, monorepo mobile and backend platform designed to eliminate the social friction and financial chaos of shared expenses. Whether managing group travel costs, flatmate rent & utilities, dinner outings, or party tabs, SplitFlow provides transparent, real-time expense calculations with deep UPI and payment QR integration.

Built with a **React Native (Expo)** mobile application and a high-performance **Node.js + Express + MongoDB Atlas** backend.

---

## 📸 Key Features

- **100% Dynamic Data Architecture**: Zero hardcoded dummy data. All group totals, individual contributions, spending highlights, and balances are computed live from real MongoDB Atlas documents.
- **Group Management & Native Sharing**: Create groups with auto-generated unique codes (`GOA482`, `BDA575`) and share direct invite links (`https://splitflow.in/join/<CODE>`) via native device share sheets.
- **Dynamic "Who Paid?" & Real-Time Split Calculation**: Custom in-app numeric keypad that dynamically calculates per-person shares in real-time as amounts are entered.
- **Instant In-Group Member Addition**: Add friends directly from the expense screen without leaving the flow.
- **Payment Intent Tracking**: An intuitive feature to declare payment schedules (e.g. *"Will pay on Friday"*, *"Next paycheck"*), reducing social anxiety around debt reminders.
- **UPI ID & QR Code Scanner Viewfinder**:
  - Automatically prompts on login to configure payment credentials.
  - Supports live camera scanning, gallery QR screenshot uploads, and auto-generation of compliant UPI QR codes.
- **Dynamic Settlement Account Selector**: Interactive bank picker allowing users to configure their preferred settlement bank (*HDFC, SBI, ICICI, Axis, Kotak, PNB*) and account details.
- **Visual Settle-Up Receipts**: Mark settlements as completed with optional screenshot/UPI payment proof attachments.
- **Chronological Group Activity Feed**: Real-time event auditing logging group creations, added expenses, and settled payments.
- **Dual-Port Server Architecture**: Backend server binds to ports `3000` and `5000` simultaneously to ensure seamless mobile connectivity across varied network firewalls.

---

## 🏗️ System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    SplitFlow Mobile Client                    │
│             (React Native 0.88 • Expo SDK 58)                 │
└───────────────────────────────┬───────────────────────────────┘
                                │
                        RESTful HTTP APIs
                     (JSON Payload / Dual-Port)
                                │
┌───────────────────────────────▼───────────────────────────────┐
│                     SplitFlow Backend API                     │
│               (Node.js • Express • JWT Auth)                  │
└───────────────────────────────┬───────────────────────────────┘
                                │
                          Mongoose ODM
                                │
┌───────────────────────────────▼───────────────────────────────┐
│                      MongoDB Atlas Cluster                    │
│        (Users • Groups • Expenses • Settlements • Activity)   │
└───────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
splitFlow/
├── .gitignore                      # Monorepo git ignore specifications
├── README.md                       # Comprehensive platform documentation
│
├── frontend/                       # React Native Mobile App (Expo)
│   ├── app/                        # Expo Router dynamic screens
│   │   ├── _layout.jsx             # Root layout with SafeArea & ProfileProvider
│   │   ├── index.jsx               # Onboarding & welcome carousel
│   │   ├── login.jsx               # Login with post-auth UPI/QR popup modal
│   │   ├── signup.jsx              # Account registration with MongoDB sync
│   │   ├── create-or-join.jsx      # Group creation & invite code join flow
│   │   ├── dashboard.jsx           # Net balances & active group switchers
│   │   ├── group-summary.jsx       # Real-time group totals & invite sharing
│   │   ├── add-expense.jsx         # Keypad expense entry & dynamic member splitting
│   │   ├── track-intent.jsx        # Debt declaration & scheduled intent tracking
│   │   ├── settle-up.jsx           # Payment settlement with proof attachment
│   │   ├── activity.jsx            # Group audit trail & activity feed
│   │   └── profile.jsx             # User profile, bank selector & QR config
│   │
│   ├── src/
│   │   ├── components/common/      # Modular design system components
│   │   │   ├── Button.jsx          # Styled primary/secondary buttons
│   │   │   ├── InputField.jsx      # Standard text inputs with icon badges
│   │   │   ├── PaginationDots.jsx  # Carousel page indicators
│   │   │   ├── ProfileAvatar.jsx   # Dynamic user avatar badge
│   │   │   └── SocialButton.jsx    # OAuth provider button tiles
│   │   ├── constants/              # Theme & design tokens
│   │   │   ├── colors.js           # Brand color palettes (#BF78EF, #21A47D)
│   │   │   ├── spacing.js          # Margin and padding constants
│   │   │   └── typography.js       # Typography scales & font weights
│   │   ├── context/
│   │   │   └── ProfileContext.jsx  # Global React state for active user profile
│   │   └── services/               # Modular API service layers
│   │       ├── api.js              # Fetch wrapper with timeout & token handling
│   │       ├── authService.js      # Register, login, profile updates
│   │       ├── groupService.js     # Group CRUD, member joins, summaries
│   │       ├── expenseService.js   # Expense creation & intent logging
│   │       ├── settlementService.js# Balance fetching & settlement handling
│   │       └── activityService.js  # Group activity history
│   │
│   ├── assets/                     # App icons, 3D graphics & branding assets
│   ├── app.json                    # Expo configuration metadata
│   └── package.json                # Frontend package dependencies
│
└── backend/                        # Node.js REST API Server
    ├── server.js                   # Express application entry & dual-port listener
    ├── .env.example                # Sample environment configuration template
    ├── package.json                # Backend package dependencies
    └── src/
        ├── config/
        │   ├── db.js               # MongoDB Atlas connection handler
        │   └── jwt.js              # Token signing & verification utilities
        ├── models/                 # Mongoose database schemas
        │   ├── user.model.js       # User profile, UPI ID, QR URI, bank details
        │   ├── group.model.js      # Group name, type, code & member array
        │   ├── expense.model.js    # Expense amount, splits, category, intent
        │   ├── settlement.model.js # Settlement receipts & verification status
        │   └── activity.model.js   # Audit logs & activity timeline entries
        ├── controllers/            # Route controllers & business logic
        │   ├── auth.controller.js  # Auth handlers & profile synchronization
        │   ├── group.controller.js # Group calculations & live highlights
        │   ├── expense.controller.js# Expense creation & split computing
        │   ├── settlement.controller.js# Net balance calculations & settlement
        │   └── activity.controller.js# Chronological activity queries
        ├── middleware/
        │   └── auth.middleware.js  # Bearer token validation middleware
        └── routes/                 # Express API endpoint definitions
            ├── auth.routes.js      # /api/auth
            ├── group.routes.js     # /api/groups
            ├── expense.routes.js   # /api/expenses
            ├── settlement.routes.js# /api/settlements
            └── activity.routes.js  # /api/activities
```

---

## 🔌 API Endpoints Specification

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Authenticate existing user | `{ email, password }` |
| `GET` | `/api/auth/profile` | Retrieve authenticated profile | *Bearer Token or latest* |
| `PUT` | `/api/auth/profile` | Update profile (bank, UPI, QR, name) | `{ name, upiId, qrCodeUri, bankAccount, gentleReminders }` |

### Groups (`/api/groups`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/groups` | List all user groups | — |
| `POST` | `/api/groups` | Create new expense group | `{ name, type, userName }` |
| `POST` | `/api/groups/join` | Join group via invite code / link | `{ codeOrLink, userName }` |
| `GET` | `/api/groups/:id` | Fetch group details by ID | — |
| `GET` | `/api/groups/:id/summary` | Live calculations: total spent, member totals, highlights | — |
| `POST` | `/api/groups/:id/members` | Add new member directly to group | `{ name }` |

### Expenses (`/api/expenses`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/expenses` | Record group expense & split | `{ groupId, amount, description, category, paidByName }` |
| `GET` | `/api/expenses/group/:groupId` | List expenses for a group | — |
| `POST` | `/api/expenses/intent` | Log repayment intent schedule | `{ groupId, amount, plan, targetUserName, message }` |

### Settlements (`/api/settlements`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/settlements/balances` | Compute live net balances across groups | — |
| `POST` | `/api/settlements` | Settle dues & attach proof | `{ amount, toUserName, recipientUpi, proofUri }` |
| `POST` | `/api/settlements/settle-all` | Clear all pending balances | — |
| `GET` | `/api/settlements/recent` | Fetch historical settlements | — |

### Activities (`/api/activities`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activities` | List chronological activity feed | — |
| `GET` | `/api/activities/group/:groupId` | List group-specific activity feed | — |

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on iOS or Android (or an emulator)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster account or local MongoDB instance

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/splitFlow?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d
```

Start the backend server:
```bash
npm start
# Server starts simultaneously on port 3000 and secondary port 5000
```

Verify backend health:
```bash
curl http://localhost:5000/
# Output: { "app": "SplitFlow API", "status": "online", "database": "MongoDB" }
```

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

- Open the **Expo Go** application on your device.
- Scan the QR code displayed in the terminal.
- Test in Android Emulator, iOS Simulator, or Web by pressing `a`, `i`, or `w`.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Mobile Framework** | React Native (Expo SDK 58, Expo Router) |
| **Language** | JavaScript (ES6+ / JSX) |
| **Icons & Styling** | Lucide React Native, Custom Design Tokens |
| **Native Device APIs** | Expo Image Picker (Camera & Gallery), Expo Clipboard, Native Share |
| **Server Framework** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |

---

## 📄 License

This project is licensed under the MIT License.
