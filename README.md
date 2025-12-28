# KickZone - Sports Field Booking Platform

KickZone is a modern, full-featured web application for booking sports fields and managing reservations. Built with Angular, it provides a seamless experience for users to discover, book, and manage sports facilities, while offering powerful tools for field owners and administrators.

## 🚀 Features

### User Features
- **User Registration & Authentication**: Secure signup with email verification, login, and password recovery
- **Field Discovery**: Browse and search sports fields by location, category, and availability
- **Real-time Booking**: Interactive reservation system with time slot selection
- **Booking Management**: View and manage personal bookings and reservation history
- **User Profiles**: Comprehensive user profile management with contact information

### Field Owner Features
- **Field Management**: Add, edit, and manage sports field listings
- **Reservation Oversight**: Monitor and manage reservations for owned fields
- **Withdrawal Management**: Track and manage earnings and withdrawals
- **Dashboard**: Dedicated dashboard for field owners with analytics and insights

### Admin Features
- **User Management**: Oversee all users, field owners, and administrators
- **Field Oversight**: Review and manage all field listings
- **Reservation Monitoring**: Comprehensive view of all reservations across the platform
- **System Administration**: Full administrative controls and reporting

### Technical Features
- **Real-time Updates**: SignalR integration for live notifications and updates
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX**: Glassmorphism effects, smooth animations, and Material Design 3
- **Accessibility**: WCAG compliant with proper focus states and keyboard navigation
- **Security**: JWT-based authentication with role-based access control

## 🛠️ Tech Stack

- **Framework**: Angular 21
- **UI Library**: Angular Material 21
- **Styling**: Custom SCSS with CSS Variables, Bootstrap 5.3
- **Real-time Communication**: Microsoft SignalR
- **State Management**: RxJS for reactive programming
- **Build Tool**: Angular CLI 21
- **Testing**: Jasmine + Karma
- **Linting**: ESLint with Angular-specific rules

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kick-zone-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `src/environments/environment.ts` to `environment.development.ts` and `environment.prod.ts`
   - Update API endpoints and configuration as needed

4. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

## 📜 Available Scripts

- `npm start` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode for development
- `npm test` - Run unit tests with Karma
- `npm run serve:ssr:KickZone_Project` - Serve with Server-Side Rendering

## 🏗️ Project Structure

```
src/
├── app/
│   ├── auth/                 # Authentication components and guards
│   ├── Component/            # Feature components
│   │   ├── Home/            # Landing page
│   │   ├── bookings/        # User bookings
│   │   ├── field-owner-dashboard/  # Field owner interface
│   │   └── ...
│   ├── dialogs/             # Modal dialogs
│   ├── Interfaces/          # TypeScript interfaces
│   ├── Model/               # Data models
│   ├── services/            # API and business logic services
│   └── ...
├── environments/            # Environment configurations
└── ...
```

## 🔐 Authentication & Authorization

The application implements a comprehensive authentication system with:
- JWT token-based authentication
- Role-based access control (User, Field Owner, Admin)
- Route guards for protected pages
- Automatic token refresh
- Secure logout functionality

## 🎨 UI/UX Design

KickZone features a modern design system with:
- **Color Palette**: Sea Green primary with Warm Yellow accents
- **Glassmorphism**: Subtle transparency effects for depth
- **Animations**: Smooth transitions using cubic-bezier timing
- **Responsive Layout**: Mobile-first approach with breakpoint optimization
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🧪 Testing

Run the test suite with:
```bash
npm test
```

Tests include unit tests for components, services, and utilities.

## 📚 Documentation

Additional documentation available:
- [Auth & User Implementation Summary](AUTH_USER_IMPLEMENTATION_SUMMARY.md)
- [Auth User Quick Start](AUTH_USER_QUICK_START.md)
- [Modern UI Guide](MODERN_UI_GUIDE.md)
- [UI Quick Reference](UI_QUICK_REFERENCE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support and questions, please open an issue in the repository or contact the development team.

