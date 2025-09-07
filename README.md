# Flashcard Research Synthesizer

A modern, serverless web application for creating and managing research projects with AI-powered flashcard generation. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Project Management**: Create and organize research projects
- **Note Taking**: Rich text editor for research notes
- **Internationalization**: Full support for English and Farsi (RTL)
- **Serverless Architecture**: Built with Next.js API routes
- **Real-time Database**: Powered by Supabase
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript support

## 🏗️ Architecture

This project uses a **clean serverless architecture**:

- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **Deployment**: Vercel (optimized for serverless)

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **UI Components**: Radix UI + Custom components
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (serverless functions)
│   │   │   ├── projects/      # Project management endpoints
│   │   │   └── notes/         # Note management endpoints
│   │   ├── project/[id]/      # Project detail pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── CreateProjectDialog.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── LocaleContext.tsx
│   │   └── RichTextEditor.tsx
│   └── lib/                   # Utilities and configurations
│       ├── supabase.ts        # Supabase client and types
│       └── utils.ts           # Utility functions
├── supabase/                  # Database migrations
├── public/                    # Static assets
└── Documentation/            # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/samandalib/flashcardMCP.git
   cd flashcardMCP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   Run the migrations in your Supabase dashboard or using the Supabase CLI:
   ```bash
   # If you have Supabase CLI installed
   supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses two main tables:

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notes Table
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🌐 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project

### Notes
- `GET /api/projects/[id]/notes` - List notes for a project
- `POST /api/projects/[id]/notes` - Create a new note
- `PUT /api/notes/[id]` - Update a note
- `DELETE /api/notes/[id]` - Delete a note

## 🌍 Internationalization

The application supports multiple languages:
- **English** (LTR)
- **Farsi** (RTL)

Language switching is handled by the `LocaleContext` and `LanguageSwitcher` components.

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy** - Vercel will automatically build and deploy

The `vercel.json` configuration is already set up for optimal deployment.

### Manual Deployment

```bash
npm run build
npm start
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting (if configured)

## 📚 Documentation

- [Architecture Decisions](./Documentation/Architecture/stack-decisions.md)
- [UI Design Principles](./Documentation/Architecture/ui-design-principles.md)
- [Implementation Guide](./Documentation/Technical/implementation-guide.md)
- [Product Requirements](./Documentation/PRD/current.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend-as-a-service
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Lucide](https://lucide.dev/) for beautiful icons