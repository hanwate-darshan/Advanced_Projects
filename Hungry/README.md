# 🍔 Hungry — Full-Stack Food Delivery Platform

**Hungry** is a production-grade, real-time food delivery web application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). It connects three key stakeholders — **Customers**, **Restaurant Owners**, and **Delivery Riders** — under a unified **Admin Panel** for complete platform management.

The platform features real-time order tracking via **Socket.IO**, integrated **Razorpay** payments, **AI-powered food recommendations**, geolocation-based delivery assignment, OTP-verified deliveries, and a full-featured admin dashboard with analytics and user management.

---

## ✨ Key Features

### 👤 Customer (User)
- **Browse & Search** — Explore restaurants and food items by city with category-based filtering (Pizza, Burgers, Chinese, South Indian, etc.)
- **Smart Recommendations** — AI-powered food suggestions based on past order history using Hugging Face models
- **Cart & Checkout** — Add items from multiple restaurants, manage cart, and place orders
- **Payment Options** — Cash on Delivery (COD) or Online Payment via Razorpay integration
- **Real-Time Order Tracking** — Live order status updates (Pending → Preparing → Out for Delivery → Delivered) via WebSockets
- **Live Delivery Tracking** — Track delivery boy location on a real-time map during "Out for Delivery" status
- **OTP Delivery Verification** — Receive a 4-digit OTP via email to confirm delivery handoff
- **Order History** — View all past orders with details and status
- **Forgot Password** — OTP-based password reset via email

### 🏪 Restaurant Owner
- **Shop Management** — Create and manage restaurant profile with name, image, address, city, and state
- **Menu Management** — Add, edit, and manage food items with name, image, price, category, food type (veg/non-veg), and availability toggle
- **Order Dashboard** — Real-time incoming order notifications via Socket.IO
- **Order Status Control** — Update order statuses: Pending → Preparing → Out for Delivery
- **Delivery Assignment** — Automatically broadcast delivery requests to nearby available riders when marking "Out for Delivery"
- **Delivery Boy Tracking** — View assigned rider location on map after assignment

### 🏍️ Delivery Rider (Delivery Boy)
- **Available Orders** — Receive real-time delivery assignment broadcasts with order details
- **Accept/Reject Orders** — Accept available delivery requests (one active order at a time)
- **Live GPS Tracking** — Continuous location sharing via `navigator.geolocation.watchPosition` with Socket.IO
- **Delivery Map** — Visual map showing rider's current location and customer's delivery location
- **OTP Verification** — Enter customer's OTP to confirm successful delivery
- **Today's Earnings** — Dashboard showing daily delivery count, earnings (₹50/delivery), and hourly delivery chart
- **Smart Assignment** — Geospatial querying (`$near` with `2dsphere` index) to find nearby available riders

### 🛡️ Admin Panel
- **Dashboard** — Platform overview with key metrics, stats, and analytics
- **User Management** — Manage customers with view, block/unblock, and account status controls
- **Owner Management** — Approve/reject restaurant owners, manage approval status
- **Rider Management** — Approve/reject delivery riders, monitor rider status
- **Restaurant Management** — View all restaurants, activate/deactivate/suspend shops, manage individual menu items
- **Order Management** — View all platform orders, filter, and track order lifecycle
- **Live Deliveries** — Real-time map view of all active deliveries across the platform
- **Payment Tracking** — Monitor all payments (COD and online) with status tracking
- **Revenue Analytics** — Revenue reports and business performance metrics
- **Complaint System** — Handle user complaints with categories (Food Quality, Wrong Order, Late Delivery, etc.), priority levels, and resolution workflow
- **Coupon Management** — Create and manage discount coupons with percentage/fixed discounts, min order, max discount, usage limits, and expiry dates
- **Push Notifications** — Send targeted notifications to all users, specific roles (customers/owners/riders), or individual users
- **Platform Settings** — Configure delivery radius, delivery fee, platform commission, min order amount, max COD amount, OTP expiry, and maintenance mode
- **Activity Logs** — Complete audit trail of all admin actions
- **Admin Profile** — Update admin credentials (name, email, password, mobile)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework with hooks-based architecture |
| **Vite** | Fast build tool and dev server |
| **Redux Toolkit** | Global state management (user, cart, orders, map) |
| **React Router DOM** | Client-side routing with protected routes |
| **Socket.IO Client** | Real-time WebSocket communication |
| **Axios** | HTTP client for API calls |
| **Leaflet / React-Leaflet** | Interactive maps for delivery tracking |
| **Recharts** | Charts for analytics and delivery stats |
| **React Icons** | Icon library (FontAwesome 6 icons) |
| **React Spinners** | Loading states and animations |
| **Tailwind CSS** | Utility-first CSS framework |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework for REST APIs |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **Socket.IO** | Real-time bidirectional event-based communication |
| **Razorpay SDK** | Payment gateway integration |
| **JWT (jsonwebtoken)** | Token-based authentication via HTTP-only cookies |
| **bcryptjs** | Password hashing |
| **Cloudinary** | Cloud-based image upload and storage |
| **Multer** | Multipart file upload middleware |
| **Nodemailer** | Email service for OTPs and password resets |
| **Hugging Face API** | AI-powered food recommendation engine |
| **dotenv** | Environment variable management |

---

## 📁 Project Structure

```
Hungry/
├── backend/
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── controllers/
│   │   ├── admin.controllers.js      # Admin panel operations (55KB+)
│   │   ├── auth.controllers.js       # Sign up, sign in, forgot password
│   │   ├── item.controllers.js       # CRUD for food items
│   │   ├── order.controllers.js      # Order lifecycle, delivery, OTP
│   │   ├── recommendation.controllers.js  # AI food recommendations
│   │   ├── shop.controllers.js       # Shop CRUD operations
│   │   └── user.controllers.js       # User profile operations
│   ├── middlewares/
│   │   └── auth.middleware.js        # JWT verification middleware
│   ├── models/
│   │   ├── adminActivity.model.js    # Admin action audit logs
│   │   ├── adminNotification.model.js # Push notifications
│   │   ├── complaint.model.js        # User complaints
│   │   ├── coupon.model.js           # Discount coupons
│   │   ├── deliveryAssignment.model.js # Delivery broadcast/assignment
│   │   ├── item.model.js             # Food item schema
│   │   ├── order.model.js            # Order with shop sub-orders
│   │   ├── platformSetting.model.js  # Platform configuration
│   │   ├── shop.model.js             # Restaurant schema
│   │   └── user.model.js             # User with roles & geolocation
│   ├── routes/
│   │   ├── admin.routes.js           # Admin API routes
│   │   ├── auth.routes.js            # Auth routes
│   │   ├── item.routes.js            # Item CRUD routes
│   │   ├── order.routes.js           # Order management routes
│   │   ├── recommendation.routes.js  # AI recommendation routes
│   │   ├── shop.routes.js            # Shop routes
│   │   └── user.routes.js            # User profile routes
│   ├── utils/
│   │   ├── ai.js                     # Hugging Face AI integration
│   │   ├── cloudinary.js             # Image upload config
│   │   ├── mail.js                   # Nodemailer email service
│   │   └── token.js                  # JWT token generation
│   ├── socket.js                     # Socket.IO event handlers
│   ├── index.js                      # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── components/           # Admin UI components
│   │   │   ├── layouts/
│   │   │   │   └── AdminLayout.jsx   # Admin sidebar layout
│   │   │   └── pages/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminCustomers.jsx
│   │   │       ├── AdminOwners.jsx
│   │   │       ├── AdminRiders.jsx
│   │   │       ├── AdminRestaurants.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       ├── AdminLiveDeliveries.jsx
│   │   │       ├── AdminPayments.jsx
│   │   │       ├── AdminRevenue.jsx
│   │   │       ├── AdminComplaints.jsx
│   │   │       ├── AdminCoupons.jsx
│   │   │       ├── AdminNotifications.jsx
│   │   │       ├── AdminAnalytics.jsx
│   │   │       ├── AdminSettings.jsx
│   │   │       ├── AdminActivityLogs.jsx
│   │   │       └── AdminLogin.jsx
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx    # Admin dashboard widget
│   │   │   ├── AuthLayout.jsx        # Auth page wrapper
│   │   │   ├── CartItemCard.jsx      # Cart item component
│   │   │   ├── CategoryCard.jsx      # Food category filter card
│   │   │   ├── DeliveryBoy.jsx       # Rider dashboard
│   │   │   ├── DeliveryBoyTracking.jsx # Map tracking component
│   │   │   ├── FoodCard.jsx          # Food item display card
│   │   │   ├── Nav.jsx               # Navigation bar
│   │   │   ├── OwnerDashboard.jsx    # Owner home dashboard
│   │   │   ├── OwnerItemCard.jsx     # Owner's menu item card
│   │   │   ├── OwnerOrderCard.jsx    # Owner's order management card
│   │   │   ├── UserDashboard.jsx     # Customer home with categories
│   │   │   └── UserOrderCard.jsx     # Customer order history card
│   │   ├── hooks/
│   │   │   ├── useGetCity.jsx        # Auto-detect user's city via GPS
│   │   │   ├── useGetCurrentUser.jsx # Fetch logged-in user
│   │   │   ├── useGetItemsByCity.jsx  # Fetch items in user's city
│   │   │   ├── useGetMyOrders.jsx    # Fetch user's order history
│   │   │   ├── useGetMyShop.jsx      # Fetch owner's shop
│   │   │   ├── useGetRecommendations.jsx # AI recommendations
│   │   │   ├── useGetShopByCity.jsx  # Fetch shops in city
│   │   │   └── useUpdateLocation.jsx # GPS location updater
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page (role-based)
│   │   │   ├── SignUp.jsx            # Registration (User/Owner/Rider)
│   │   │   ├── SignIn.jsx            # Login page
│   │   │   ├── ForgotPassword.jsx    # Password reset with OTP
│   │   │   ├── Shop.jsx              # Individual shop page
│   │   │   ├── CartPage.jsx          # Shopping cart
│   │   │   ├── CheckOut.jsx          # Checkout with address & payment
│   │   │   ├── OrderPlaced.jsx       # Order confirmation
│   │   │   ├── MyOrders.jsx          # Order history
│   │   │   ├── TrackOrderPage.jsx    # Live order tracking with map
│   │   │   ├── CreateEditShop.jsx    # Create/edit restaurant
│   │   │   ├── AddItem.jsx           # Add menu item
│   │   │   └── EditItem.jsx          # Edit menu item
│   │   ├── redux/
│   │   │   ├── store.js              # Redux store config
│   │   │   ├── userSlice.js          # User, auth, cart, orders state
│   │   │   ├── mapSlice.js           # Map/location state
│   │   │   └── ownerSlice.js         # Owner shop state
│   │   ├── App.jsx                   # Main app with routing
│   │   ├── main.jsx                  # React entry point
│   │   ├── index.css                 # Global styles & design system
│   │   └── category.js               # Food category definitions
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or MongoDB Atlas)
- **Razorpay** account (for online payments)
- **Cloudinary** account (for image uploads)
- **Gmail** account with App Password (for emails)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Hungry.git
cd Hungry
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hungry

JWT_SECRET=your_jwt_secret_key

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# AI Recommendations (Optional — works without it)
HF_ENDPOINT=https://api-inference.huggingface.co/models/your-model
HF_MODEL=your-model-name
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx

# Admin Credentials (auto-seeded on first run)
ADMIN_FULLNAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_MOBILE=
```

Start the backend server:

```bash
npm run dev
```

The server starts at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user (user/owner/deliveryBoy) |
| POST | `/signin` | Login with email & password |
| POST | `/forgot-password` | Request OTP for password reset |

### User (`/api/user`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/get-user` | Get current logged-in user |

### Shop (`/api/shop`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create restaurant (owner) |
| GET | `/my-shop` | Get owner's shop |
| GET | `/get-shop-by-city` | Get shops by city |

### Item (`/api/item`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add` | Add food item with image |
| PUT | `/edit/:id` | Edit food item |
| GET | `/get-items-by-city` | Get all items in city |

### Order (`/api/order`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/place-order` | Place a new order |
| POST | `/verify-payment` | Verify Razorpay payment |
| GET | `/my-orders` | Get user's orders (role-aware) |
| PUT | `/update-status/:orderId/:shopId` | Update order status |
| GET | `/get-assignments` | Get available delivery assignments |
| GET | `/accept-order/:assignmentId` | Accept delivery assignment |
| GET | `/get-current-order` | Get rider's active delivery |
| POST | `/send-delivery-otp` | Send OTP to customer |
| POST | `/verify-delivery-otp` | Verify OTP & mark delivered |
| GET | `/get-today-deliveries` | Rider's daily delivery stats |
| GET | `/get-order/:orderId` | Get order by ID |

### Recommendations (`/api/recommendations`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get AI-powered food recommendations |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Admin login |
| GET | `/dashboard-stats` | Platform overview statistics |
| GET | `/customers` | List all customers |
| GET | `/owners` | List all owners |
| GET | `/riders` | List all riders |
| PUT | `/block-user/:id` | Block/unblock user |
| GET | `/restaurants` | List all restaurants |
| PUT | `/restaurant/:id/status` | Change shop status |
| GET | `/orders` | List all orders |
| GET | `/complaints` | List complaints |
| POST | `/complaints` | File a complaint |
| PUT | `/complaints/:id` | Resolve/reject complaint |
| GET | `/coupons` | List coupons |
| POST | `/coupons` | Create coupon |
| DELETE | `/coupons/:id` | Delete coupon |
| GET | `/notifications` | List notifications |
| POST | `/notifications` | Send notification |
| GET | `/settings` | Get platform settings |
| PUT | `/settings` | Update platform settings |
| GET | `/activity-logs` | Get admin activity logs |
| PUT | `/profile` | Update admin profile |

---

## 🔄 Real-Time Events (Socket.IO)

| Event | Direction | Description |
|-------|-----------|-------------|
| `identity` | Client → Server | Register user's socket with userId |
| `updateLocation` | Client → Server | Rider sends GPS coordinates |
| `newOrder` | Server → Owner | New order notification |
| `newAssignment` | Server → Rider | Delivery assignment broadcast |
| `newAssignmentBroadcast` | Server → All Riders | Global delivery assignment fallback |
| `update-status` | Server → Client | Order status change notification |
| `deliveryOtp` | Server → Customer | OTP for delivery verification |
| `updateDeliveryLocation` | Server → All | Rider location update broadcast |
| `orderAssigned` | Server → Rider | Order accepted confirmation |

---

## 🗃️ Database Models

| Model | Description |
|-------|-------------|
| **User** | All platform users with roles (user, owner, deliveryBoy, admin), geolocation (2dsphere), approval/account status |
| **Shop** | Restaurant with name, image, owner, address, city, items array, and status |
| **Item** | Food item with category, price, food type (veg/non-veg), rating, availability, and approval |
| **Order** | Multi-shop order with sub-orders, delivery address, payment status, Razorpay integration |
| **DeliveryAssignment** | Tracks delivery broadcasts, assigned rider, and assignment lifecycle |
| **Complaint** | Customer complaints with categories, priority, status, and admin resolution |
| **Coupon** | Discount coupons with percentage/fixed type, limits, and expiry |
| **PlatformSetting** | Global configs (delivery radius, fees, commission, COD limits, maintenance mode) |
| **AdminNotification** | Targeted push notifications from admin |
| **AdminActivity** | Audit log of admin actions with IP tracking |

---

## 🎨 Food Categories

| Category | Type |
|----------|------|
| 🍿 Snacks | Appetizers & light bites |
| 🍛 Main Course | Full meals |
| 🍰 Desserts | Sweets & cakes |
| 🍕 Pizza | Italian pies |
| 🍔 Burgers | Burgers & sliders |
| 🥪 Sandwiches | Subs & wraps |
| 🥘 South Indian | Dosa, idli, etc. |
| 🍲 North Indian | Curry, roti, etc. |
| 🥡 Chinese | Noodles, manchurian, etc. |
| 🍟 Fast Food | Quick bites |
| 📦 Others | Miscellaneous |

---

## 🔐 Authentication Flow

1. User registers with **fullName, email, password, mobile, role**
2. Password is hashed with **bcryptjs** before storing
3. On login, a **JWT token** is generated and set as an **HTTP-only cookie**
4. All protected routes verify the JWT via auth middleware
5. Admin uses a separate login endpoint with env-configured credentials
6. Admin account is **auto-seeded** on first server start

---

## 🚀 Deployment Notes

- Set `MONGO_URI` to a MongoDB Atlas connection string for production
- Configure Razorpay **live keys** (replace test keys)
- Set up a proper SMTP service for production emails
- Update CORS origins in `backend/index.js` for your production domain
- Build frontend: `cd frontend && npm run build`
- The AI recommendation feature is **optional** — the app works fully without Hugging Face credentials

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Darshan Hanwate**

---

> Built with ❤️ using the MERN Stack, Socket.IO, Razorpay, and Hugging Face AI
