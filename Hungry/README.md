# 🍔 Hungry — Hyper-Local Food Delivery & AI Ecosystem

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-orange.svg)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/RealTime-Socket.IO-black.svg)](https://socket.io)
[![AI Powered](https://img.shields.io/badge/AI-Groq%20%7C%20Qwen%20%7C%20HF-emerald.svg)](https://groq.com)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-blue.svg)](https://razorpay.com)
[![Leaflet GIS](https://img.shields.io/badge/Maps-Leaflet%20GIS-green.svg)](https://leafletjs.com)

**Hungry** is a modern, production-grade, hyper-local food delivery web application built with the **MERN Stack** (MongoDB, Express.js, React 19, Node.js). It seamlessly connects four key stakeholders:
1. 👤 **Customers (Foodies)** — Discover dishes, get AI recommendations, chat with the Hungry AI Assistant, and track orders in real time.
2. 🏪 **Restaurant Owners** — Manage storefronts, publish menus with AI copywriters, and dispatch orders to nearby riders.
3. 🏍️ **Delivery Riders** — Accept broadcasts, navigate with live GPS tracking, and verify deliveries via secure OTP handoffs.
4. 🛡️ **SuperAdmin** — Full platform command center with live GIS radar, owner/rider verification, complete menu moderation, dynamic tariffs, and AI business intelligence.

---

## 🌟 What is Hungry All About?

Hungry solves the complete end-to-end food delivery lifecycle with speed, intelligence, and hyper-local efficiency:
- **Instant Discovery & AI Recommendations:** Customers don't have to scroll aimlessly. The platform learns dining habits and recommends top dishes in their city with appetizing *"Why this?"* rationales.
- **Hungry AI Food Concierge:** A native, interactive food chatbot embedded into the app that understands cravings, budgets, and dietary restrictions, then suggests matching dishes with a one-click **"Add to Cart"** action.
- **Smart Geolocation Dispatch:** Orders are automatically routed to delivery riders within a configurable dynamic dispatch radius using MongoDB geospatial queries (`2dsphere` index).
- **Live Visual Delivery Tracking:** Both customers and restaurant owners watch the assigned rider's scooter move on a live OpenStreetMap map in real time via WebSockets.
- **Secure Email OTP Handoff:** Food deliveries are confirmed using a 4-digit verification OTP emailed to the customer, preventing wrong handoffs and fraudulent claims.
- **Executive Administration & Moderation:** Complete platform control — from approving new restaurant owners and delivery riders to toggling stock availability, moderating menus, adjusting commission tariffs, and monitoring platform revenue.

---

## ✨ Key Features & Stakeholders

### 👤 1. Customer (Foodie Experience)
- **City-Aware Geolocation:** Automatically detects user city or allows manual selection to display active local restaurants and fresh menus.
- **🤖 Hungry AI Food Assistant (`AiFoodAssistant.jsx`):**
  - Interactive chatbot accessible from the floating action widget, navbar, or hero banner.
  - Understands natural language cravings (e.g. *"Spicy snacks under ₹150"*, *"Healthy veg dinner"*, *"Late night desserts"*).
  - Fetches the active city catalogue, recommends top dishes, and allows instant **"+ Add to Cart"** right from the chat bubble.
- **✨ "Recommended for You" Feed:**
  - AI-driven recommendation carousel tailored to user's past ordering history and local ratings.
  - Features real-time AI-crafted **"Why this?"** reasons on each card.
- **Category-Based Filtering:** Quick pills for Snacks, Main Course, Pizza, Burgers, Sandwiches, South Indian, North Indian, Chinese, Fast Food, and Desserts.
- **Synchronized Cart & Checkout:**
  - Dynamic cart with real-time total calculations and live item quantity sync on food cards.
  - Automatic cart clearing upon successful checkout (COD or Razorpay).
- **Flexible Payments:** Cash on Delivery (COD) or instant online payment via Razorpay.
- **Live Real-Time Tracking:** Watch order progression (Pending → Preparing → Out for Delivery → Delivered) with live rider GPS coordinates on Leaflet map.
- **Order History & Invoices:** Complete log of past orders with shop details, status pills, and breakdown.

---

### 🏪 2. Restaurant Owner
- **Restaurant Profile Management:** Create and edit restaurant details (name, banner photo via Cloudinary, city, full address).
- **Menu Management with AI:**
  - Add, update, and manage menu items (name, price, veg/non-veg flag, category, availability).
  - **✨ AI Menu Description Generator:** One-click button generates mouth-watering, restaurant-grade descriptions in under a second using Hungry AI.
- **Real-Time Order Desk:** Instant audio/visual alert via Socket.IO whenever a customer places an order.
- **Order Lifecycle Controls:** Shift orders from Pending to Preparing and mark Out for Delivery.
- **Automated Rider Dispatch:** Broadcasting delivery requests to all active riders within the restaurant's operational radius.
- **Live Rider Tracking:** View assigned delivery partner's coordinates on a map once dispatched.

---

### 🏍️ 3. Delivery Rider (Partner)
- **Real-Time Delivery Broadcasts:** Receive instant push notifications of available orders with pick-up and delivery details.
- **Accept/Reject Flow:** Claim available orders on a first-come, first-served basis (one active delivery at a time).
- **Continuous GPS Broadcasting:** Seamless background location sharing via `navigator.geolocation.watchPosition` piped directly through Socket.IO.
- **Interactive Route Map:** Live Leaflet map displaying current rider position relative to customer destination.
- **OTP Handoff Verification:** Enter customer's 4-digit OTP to verify delivery handoff and complete the order.
- **Daily Performance Dashboard:** Live metrics tracking completed orders, earnings (₹50/delivery), and delivery history.

---

### 🛡️ 4. SuperAdmin Command Center
- **Executive Overview & Stats:** Real-time platform pulse (Total Orders, Gross GMV, Platform Commission Revenue, Active Shops, Riders).
- **🤖 Operational AI Analytics:** Live executive insights generated by Hungry AI assessing peak demand hours, fleet placement tips, and combo bundling strategies.
- **Pending Approvals System:** Dedicated approval queues for newly registered restaurant owners and delivery riders before they can operate.
- **Complete Restaurant & Menu Moderation:**
  - Search restaurants by name or city.
  - Inspect entire restaurant menus in real time.
  - **Live Stock Moderation:** Toggle items `In Stock` / `Out of Stock`.
  - **Item Moderation:** Approve or hide items (`Approved` / `Hidden`) from customers.
  - **Item Management:** Add new dishes directly to any restaurant with Cloudinary uploads, or delete invalid items.
  - Suspend or activate partner restaurants.
- **Live Dispatch Radar (GIS):** Leaflet map plotting all online delivery riders and active in-flight customer orders.
- **Master Order History:** Filterable table tracking every order across the platform.
- **Platform Control Center:** Configure delivery dispatch radius (km), default commission rates (%), convenience fees (₹), and toggle maintenance mode.

---

## 🛠️ Technology Stack

### Frontend Architecture
| Technology | Role & Purpose |
|---|---|
| **React 19** | Modern component-based UI with hooks & functional architecture |
| **Vite 7** | Lightning-fast development server & production bundler |
| **Redux Toolkit** | Centralized global state management (`userSlice`, `mapSlice`, `ownerSlice`) |
| **React Router DOM 7** | Declarative client-side routing with role-based route guards |
| **Socket.IO Client** | Bi-directional WebSocket communication for real-time order & GPS updates |
| **Tailwind CSS & Vanilla CSS** | Curated design tokens, warm food-inspired color palette, custom micro-animations |
| **Leaflet & React-Leaflet** | Interactive OpenStreetMap rendering for rider GPS and GIS radar |
| **Axios** | Promised-based HTTP client with credentials and session persistence |
| **React Icons (FontAwesome 6)** | High-fidelity iconography |

### Backend Architecture
| Technology | Role & Purpose |
|---|---|
| **Node.js (ESM)** | Modern ECMAScript module JavaScript runtime |
| **Express.js 5** | RESTful API framework with modular controllers and routers |
| **MongoDB & Mongoose** | NoSQL document database with schema validation and `2dsphere` geospatial indexing |
| **Socket.IO Server** | Real-time event engine handling rooms, rider broadcasting, and GPS telemetry |
| **Groq / Hugging Face SDK** | Ultra-low latency LPU / LLM inference (`qwen/qwen3.8-27b`) for Hungry AI |
| **Razorpay SDK** | Secure payment orders and HMAC SHA256 payment signature verification |
| **Cloudinary & Multer** | Cloud media storage with automatic image optimization |
| **Nodemailer** | SMTP email service dispatching delivery verification OTPs and password resets |
| **JWT & bcryptjs** | Secure authentication with password hashing and HTTP-only cookie tokens |

---

## 📁 Repository Structure

```
Hungry/
├── backend/
│   ├── config/
│   │   └── db.js                          # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── admin.controllers.js           # Admin operations, GIS radar, moderation, AI analytics
│   │   ├── auth.controllers.js            # Sign up, sign in, OTP password reset
│   │   ├── item.controllers.js            # Menu item CRUD & city filters
│   │   ├── order.controllers.js           # Order placement, Razorpay verification, OTP handoff
│   │   ├── recommendation.controllers.js  # Hungry AI recommendations, Chatbot & Copywriter
│   │   ├── shop.controllers.js            # Restaurant profiles & city queries
│   │   └── user.controllers.js            # User profile & location
│   ├── middlewares/
│   │   ├── auth.middleware.js             # Role & JWT cookie verification
│   │   └── isAuth.js                      # Authentication guard
│   ├── models/
│   │   ├── item.model.js                  # Food item schema with ratings & moderation
│   │   ├── order.model.js                 # Multi-restaurant sub-orders & payments
│   │   ├── shop.model.js                  # Restaurant schema & status
│   │   └── user.model.js                  # User schema with 2dsphere geolocation & roles
│   ├── routes/
│   │   ├── admin.routes.js                # Admin endpoints (/api/admin)
│   │   ├── auth.routes.js                 # Auth endpoints (/api/auth)
│   │   ├── item.routes.js                 # Item endpoints (/api/item)
│   │   ├── order.routes.js                # Order endpoints (/api/order)
│   │   ├── recommendation.routes.js       # AI endpoints (/api/recommendations)
│   │   ├── shop.routes.js                 # Shop endpoints (/api/shop)
│   │   └── user.routes.js                 # User endpoints (/api/user)
│   ├── utils/
│   │   ├── ai.js                          # Dynamic Hungry AI engine (Groq/OpenAI/HF)
│   │   ├── cloudinary.js                  # Image upload handler
│   │   ├── mail.js                        # Nodemailer OTP emailer
│   │   └── token.js                       # JWT signer
│   ├── socket.js                          # Real-time WebSocket event handlers
│   ├── index.js                           # Express entry point with dotenv/config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx         # Full-featured Admin management console
│   │   │   ├── AiFoodAssistant.jsx        # Floating native Hungry AI food assistant chatbot
│   │   │   ├── CartItemCard.jsx           # Individual cart item controls
│   │   │   ├── CategoryCard.jsx           # Category chip selector
│   │   │   ├── DeliveryBoy.jsx            # Rider portal & order receiver
│   │   │   ├── DeliveryBoyTracking.jsx    # Real-time Leaflet delivery tracking
│   │   │   ├── FoodCard.jsx               # Dish card with FSSAI badge & AI reason
│   │   │   ├── Nav.jsx                    # Top navbar with Ask AI & role-based buttons
│   │   │   ├── OwnerDashboard.jsx         # Restaurant owner command center
│   │   │   ├── OwnerOrderCard.jsx         # Live kitchen order display
│   │   │   ├── UserDashboard.jsx          # Customer home with Hero banner & AI suggestions
│   │   │   └── ui/                        # Reusable design system (Logo, VegBadge, Rating, Footer)
│   │   ├── hooks/
│   │   │   ├── useGetCity.jsx             # Auto-detect city via reverse geocoding
│   │   │   ├── useGetItemsByCity.jsx      # Fetch city dishes
│   │   │   ├── useGetMyOrders.jsx         # Fetch live orders
│   │   │   ├── useGetRecommendations.jsx  # Fetch AI recommendations
│   │   │   └── useUpdateLocation.jsx      # GPS updater
│   │   ├── pages/
│   │   │   ├── Home.jsx                   # Role-based landing router
│   │   │   ├── SignUp.jsx / SignIn.jsx    # Authentication views
│   │   │   ├── Shop.jsx                   # Restaurant storefront view
│   │   │   ├── CartPage.jsx               # Shopping cart & checkout transition
│   │   │   ├── CheckOut.jsx               # Address picker & payment gateway
│   │   │   ├── OrderPlaced.jsx            # Order success & tracking entry
│   │   │   ├── MyOrders.jsx               # Order history
│   │   │   └── TrackOrderPage.jsx         # Fullscreen live map order tracking
│   │   ├── redux/
│   │   │   ├── store.js                   # Redux store
│   │   │   └── userSlice.js               # State with cart sync & clearCart
│   │   ├── App.jsx                        # Root routes & persistent AI widget
│   │   └── index.css                      # Hungry warm brand design system
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Node.js** v18+ and **npm**
- **MongoDB Atlas** database connection string
- **Cloudinary** account (cloud name, API key & secret)
- **Razorpay** test account (`rzp_test_...`)
- **Groq API Key** (Free from [console.groq.com](https://console.groq.com/keys)) or Hugging Face token

---

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/Hungry.git
cd Hungry

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

Create `backend/.env` with your credentials:

```env
PORT=8000
MONGODB_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/hungry"
JWT_SECRET="your_jwt_secret_key"

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Razorpay Payments
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Email Verification (Nodemailer)
EMAIL="your_email@gmail.com"
PASS="your_gmail_app_password"

# Hungry AI Engine (Powered by Groq / Qwen / LPU)
HF_ENDPOINT="https://api.groq.com/openai/v1"
HF_MODEL="qwen/qwen3.8-27b"
HF_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# SuperAdmin Default Credentials (auto-seeded)
ADMIN_FULLNAME="Hungry SuperAdmin"
ADMIN_EMAIL="admin@hungry.com"
ADMIN_PASSWORD="admin123"
ADMIN_MOBILE="9999999999"
```

Create `frontend/.env`:

```env
VITE_RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
```

---

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Frontend Application:** `http://localhost:5173`
- **Backend API Server:** `http://localhost:8000`

---

## 🔌 Core API Endpoints

### 🤖 Hungry AI (`/api/recommendations`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get personalized dishes based on order history with AI *"Why this?"* reasons |
| `POST` | `/chat` | Chat with Hungry AI Assistant to match budget/cravings with city menu |
| `POST` | `/generate-description` | AI copywriting endpoint for restaurant dishes |

### 👤 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/signup` | Register new user (`user`, `owner`, or `deliveryBoy`) |
| `POST` | `/signin` | Authenticate user & issue HTTP-only JWT cookie |
| `GET` | `/signout` | Clear authentication cookie |
| `POST` | `/forgot-password` | Request password reset email with OTP |

### 🛒 Orders & Delivery (`/api/order`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/place-order` | Create order (COD or Razorpay order initialization) |
| `POST` | `/verify-payment` | Verify Razorpay signature & update payment status |
| `GET` | `/my-orders` | Fetch user/owner/rider order history |
| `PUT` | `/update-status/:orderId/:shopId` | Update kitchen status (Pending → Preparing → Out for Delivery) |
| `GET` | `/get-assignments` | Fetch nearby delivery broadcasts for rider |
| `GET` | `/accept-order/:assignmentId` | Accept delivery assignment |
| `POST` | `/send-delivery-otp` | Trigger 4-digit verification OTP to customer email |
| `POST` | `/verify-delivery-otp` | Validate OTP & mark order as Delivered |

### 🛡️ Admin & Moderation (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | Platform metrics & pending approval counts |
| `GET` | `/analytics/ai` | AI operational intelligence & peak demand analysis |
| `GET` | `/owners` | List restaurant owners (filterable by pending/approved) |
| `PATCH` | `/owners/:id/approval` | Approve or reject restaurant owner application |
| `GET` | `/riders` | List delivery partners (filterable by pending/approved) |
| `PATCH` | `/riders/:id/approval` | Approve or reject delivery rider partner |
| `GET` | `/restaurants` | List all registered restaurants & status |
| `GET` | `/restaurants/:id/items` | Fetch all menu items of a specific restaurant |
| `POST` | `/restaurants/:id/items` | Add a new food item directly with image upload |
| `PATCH` | `/items/:id/status` | Toggle item stock (`isAvailable`) and approval (`isApproved`) |
| `DELETE` | `/items/:id` | Delete menu item from restaurant |
| `GET` | `/deliveries/live` | Live GIS coordinates for all online riders & in-flight orders |
| `PATCH` | `/settings` | Update delivery radius, tariffs, and maintenance mode |

---

## 🔄 Real-Time WebSocket Events (Socket.IO)

```
[Customer]                 [Server]                 [Restaurant Owner]           [Delivery Rider]
    │                         │                             │                            │
    │─── Place Order ────────>│                             │                            │
    │                         │─── newOrder (audio/ping) ──>│                            │
    │                         │                             │── Mark Preparing ─────────>│
    │<── update-status ───────│<────────────────────────────│                            │
    │                         │                                                          │
    │                         │── Broadcast Delivery Request ───────────────────────────>│
    │                         │<── accept-order ─────────────────────────────────────────│
    │                         │── orderAssigned ───────────>│                            │
    │                         │                                                          │
    │                         │<── updateLocation (GPS) ─────────────────────────────────│
    │<── updateDeliveryLocation ─────────────────────────────────────────────────────────│
    │<── deliveryOtp (Email) ─│                                                          │
    │                         │<── verify-delivery-otp ──────────────────────────────────│
    │<── Order Delivered ─────│                                                          │
```

---

## 🎨 Design System & Aesthetics

Hungry features a tailored design system configured in [frontend/src/index.css](frontend/src/index.css):
- **Brand Colors:**
  - Hungry Red/Orange: `#F0410F` (`--color-blinkit-green`)
  - Deep Dark Tone: `#C7350B` (`--color-blinkit-green-dark`)
  - Soft Tint Surface: `#FEEEE8` (`--color-blinkit-green-soft`)
  - Golden Amber Accent: `#F5A623` (`--color-blinkit-yellow`)
  - Warm Canvas Backdrop: `#FAF6F2` (`--color-blinkit-bg`)
- **Typography:** Modern pairing of **Manrope** for bold headlines and **Inter** for readable interfaces.
- **Micro-Interactions:** Ambient radial glow gradients, pulsing active order badges, smooth card lifts, and custom skeleton loaders.

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Darshan Hanwate**

---

<div align="center">
  <sub>Built with ❤️ using the MERN Stack, Socket.IO, Razorpay, Leaflet GIS, and Hungry AI.</sub>
</div>
