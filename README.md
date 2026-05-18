# Algonova Feedback System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)

A comprehensive feedback and educational management system designed for **Algonova**. This platform streamlines the process of managing students, courses, lessons, and sessions while providing automated feedback mechanisms via WhatsApp integration.

## 🚀 Features

- **🎓 Educational Management**: Full CRUD operations for Students, Groups, Courses, Lessons, and Sessions.
- **💬 Automated Feedback**: Generate and send student feedback reports automatically.
- **📱 WhatsApp Integration**: Seamlessly schedule and send feedback notifications via WhatsApp Gateway.
- **🌐 Multilingual Support**: Available in Indonesian (ID), English (EN), and Russian (RU).
- **🌓 Dark/Light Mode**: Smooth theme switching for better user experience.
- **📑 Document Generation**: Automated PDF generation for feedback reports.
- **📊 Data Import/Export**: Efficiently manage large datasets using CSV import/export features.
- **🛡️ Secure Authentication**: Robust login system with Google OAuth support and ReCAPTCHA protection.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **State Management & Routing**: React Router DOM 6
- **Forms & Validation**: React Hook Form, Zod
- **API Client**: Axios
- **Internationalization**: i18next
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/azharf99/algo-feedback-frontend.git
   cd algo-feedback-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_API_BASE_URL=your_api_base_url
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 📄 License & Attribution

This project is licensed under the **Apache License 2.0**.

### 👤 Author
**Azhar Faturohman Ahidin**
- GitHub: [@azharf99](https://github.com/azharf99)

### ⚠️ Mandatory Attribution
If you use, modify, or distribute this software, you **must** provide clear attribution to **Azhar Faturohman Ahidin** as the original author, as specified in the `NOTICE` file.

---

Copyright © 2026 Azhar Faturohman Ahidin. All rights reserved.
