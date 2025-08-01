# Samoku - Multivendor Ecommerce Platform

A premium multivendor marketplace built with modern web technologies, connecting customers with trusted vendors worldwide.

![Samoku Platform](https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1200)

## 🚀 Features

### For Customers
- **Seamless Shopping Experience** - Browse products from multiple vendors in one place
- **Advanced Search & Filtering** - Find products by category, price, rating, and more
- **Secure Checkout** - Multiple payment options with encrypted transactions
- **Order Tracking** - Real-time updates on order status and shipping
- **Product Reviews** - Read and write reviews for informed purchasing decisions
- **Wishlist & Cart** - Save favorite items and manage shopping cart across sessions

### For Vendors
- **Store Management** - Create and customize your online store
- **Product Catalog** - Add, edit, and manage your product listings
- **Order Fulfillment** - Process orders and manage inventory
- **Analytics Dashboard** - Track sales, performance, and customer insights
- **Commission Tracking** - Monitor earnings and payout history
- **Dropshipping Integration** - Access to curated dropshipped products

### For Administrators
- **Platform Management** - Complete control over the marketplace
- **Vendor Approval** - Review and approve vendor applications
- **Product Moderation** - Oversee all product listings across the platform
- **Order Management** - Monitor and manage all transactions
- **Dropshipping Control** - Import and manage products from suppliers
- **Analytics & Reporting** - Comprehensive platform performance insights
- **Commission Settings** - Configure commission rates by category or vendor

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Vite** - Fast development server and build tool

### Backend
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Robust relational database
- **Row Level Security (RLS)** - Database-level security
- **Edge Functions** - Serverless API endpoints
- **Real-time subscriptions** - Live data updates

### Infrastructure
- **Supabase Auth** - User authentication and authorization
- **Supabase Storage** - File and image storage
- **Edge Functions** - Serverless computing for API logic
- **Database Migrations** - Version-controlled schema changes

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd samoku
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Click "Connect to Supabase" in the top right of the development interface

4. **Start the development server**
```bash
npm run dev
```

5. **Create admin user**
   - Navigate to `/login`
   - Click "Create admin user" button
   - Use credentials: `admin@samoku.com` / `Admin123!`

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── admin/          # Admin-specific components
│   ├── layout/         # Layout components (Header, Footer)
│   └── products/       # Product-related components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # User authentication state
│   └── CartContext.tsx # Shopping cart state
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── admin/          # Admin dashboard pages
│   ├── auth/           # Authentication pages
│   └── vendor/         # Vendor dashboard pages
├── services/           # API service layers
├── types/              # TypeScript type definitions
└── lib/                # Utility libraries

supabase/
├── functions/          # Edge Functions
│   ├── create-admin-auth/     # Admin user creation
│   ├── create-user-profile/   # User profile management
│   ├── dropshipping-import/   # Dropshipping operations
│   └── dropshipping-webhook/  # Webhook handlers
└── migrations/         # Database schema migrations
```

## 🗄 Database Schema

### Core Tables
- **users** - User accounts and profiles
- **stores** - Vendor store information
- **products** - Product catalog
- **orders** - Customer orders
- **order_items** - Individual order line items
- **payouts** - Vendor commission payouts
- **commission_settings** - Commission rate configuration

### Dropshipping Tables
- **dropshipping_config** - API configurations
- **dropshipping_products** - Imported product catalog
- **dropshipping_orders** - Order fulfillment tracking
- **dropshipping_sync_logs** - Operation logs

## 🔐 Authentication & Authorization

### User Roles
- **Customer** - Can browse and purchase products
- **Vendor** - Can manage store and products (requires approval)
- **Admin** - Full platform access and management

### Security Features
- Row Level Security (RLS) on all tables
- Role-based access control
- Encrypted password storage
- Session management
- API key protection for external services

## 🛒 Key Functionality

### Dropshipping Integration
- Import products from external APIs
- Automatic inventory synchronization
- Order fulfillment automation
- Webhook support for real-time updates
- Multiple provider support (Printful, Spocket, etc.)

### Commission System
- Configurable commission rates by category
- Automatic commission calculation
- Payout tracking and management
- Vendor earnings dashboard

### Order Management
- Real-time order processing
- Multi-vendor order splitting
- Inventory management
- Shipping and tracking integration

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Dropshipping Configuration
Configure dropshipping providers in the admin dashboard:
1. Navigate to Admin → Dropshipping → Configuration
2. Select your provider (Printful, Spocket, etc.)
3. Enter API credentials
4. Import products and sync inventory

## 🚀 Deployment

### Using Netlify (Recommended)
```bash
npm run build
# Deploy to Netlify or use the deploy button in the interface
```

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables
4. Set up Supabase edge functions

## 📱 API Documentation

### Edge Functions

#### `/functions/v1/dropshipping-import`
- Import products from dropshipping providers
- Sync inventory levels
- Process order fulfillment

#### `/functions/v1/create-user-profile`
- Create user profiles during registration
- Handle vendor store creation

#### `/functions/v1/create-admin-auth`
- Create admin user accounts
- Set up initial platform configuration

## 🧪 Testing

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check for export issues
npm run prepare
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain component modularity (max 200 lines per file)
- Write meaningful commit messages
- Ensure proper error handling

## 📋 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced payment integrations (Stripe, PayPal)
- [ ] Social media integration
- [ ] Advanced SEO optimization
- [ ] Inventory forecasting
- [ ] Automated marketing tools

## 🐛 Known Issues

- Authentication may timeout in development environments
- Some form inputs show React warnings (being addressed)
- Dropshipping sync requires manual configuration

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@samoku.com
- Documentation: [docs.samoku.com](https://docs.samoku.com)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide](https://lucide.dev) - Icon library
- [Pexels](https://pexels.com) - Stock images

---

Built with ❤️ by the Samoku team