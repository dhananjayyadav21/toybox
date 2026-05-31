# 🧸 ToyBox — Kids Toys E-Commerce

A full-stack MERN e-commerce app for kids' educational toys with Razorpay payments, OTP delivery, admin dashboard, and PDF invoices.

---

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone https://github.com/your-username/toybox.git
cd toybox
npm run install:all

# 2. Create backend/.env (see below)

# 3. Seed database
npm run seed

# 4. Run app (frontend + backend)
npm run dev
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:5000

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/toybox
JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=ToyBox <your@gmail.com>
```

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@toybox.com | password123 |
| Customer | user@toybox.com | password123 |

---

## ✨ Features

**Customer:** Browse products · Cart · Wishlist · Razorpay Checkout · Order tracking · OTP delivery confirmation · PDF Invoice · Email OTP auth

**Admin:** Sales dashboard · Product/Order/User management · Coupon codes · Category management

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Axios  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Razorpay, Nodemailer, PDFKit

---

## 📜 Scripts

```bash
npm run dev          # Run frontend + backend together
npm run seed         # Seed sample data into MongoDB
npm run backend      # Backend only (port 5000)
npm run frontend     # Frontend only (port 3000)
```

---

## 🎟️ Coupon Codes (after seeding)

| Code | Discount |
|------|----------|
| `SAVE10` | 10% off (min ₹500) |
| `WELCOME20` | 20% off (min ₹1000) |
| `FLAT100` | ₹100 off (min ₹750) |

---

## 💳 Razorpay Test Card

```
Card: 4111 1111 1111 1111  |  Expiry: Any  |  CVV: Any  |  OTP: 1234
```

---

## 👨‍💻 Author

**Dhananjay Kumar** — [GitHub](https://github.com/your-username)

<div align="center">Made with ❤️ for kids' imaginations · 🧸 Play · Grow · Joy</div>
