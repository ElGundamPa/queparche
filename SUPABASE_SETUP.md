# Supabase Setup Guide for Que Parche

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

## 2. Install Dependencies

```bash
bun add @supabase/supabase-js
```

## 3. Environment Variables

Create a `.env.local` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar TEXT,
  points INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plans table
CREATE TABLE plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] NOT NULL,
  location JSONB NOT NULL,
  max_people INTEGER NOT NULL,
  current_people INTEGER DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0,
  likes INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_sponsored BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shorts table
CREATE TABLE shorts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  place_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  plan_id UUID REFERENCES plans(id),
  short_id UUID REFERENCES shorts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  plan_id UUID REFERENCES plans(id),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now, customize later)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON plans FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON shorts FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON comments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON reviews FOR ALL USING (true);
```

## 5. Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 6. Update tRPC Procedures

Replace mock data with Supabase queries in your tRPC procedures:

```typescript
// Example: backend/trpc/routes/plans/get-all/route.ts
import { supabase } from '@/lib/supabase';

export const getAllProcedure = publicProcedure.query(async () => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
});
```

## 7. Add Zod Validation

Update your tRPC procedures with proper validation:

```typescript
import { z } from 'zod';

const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: z.string(),
  images: z.array(z.string().url()),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  maxPeople: z.number().min(1).max(100),
  price: z.number().min(0).optional(),
});

export const createPlanProcedure = publicProcedure
  .input(createPlanSchema)
  .mutation(async ({ input }) => {
    const { data, error } = await supabase
      .from('plans')
      .insert(input)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  });
```

## 8. Test Connection

Add this to your app to test the connection:

```typescript
// In your component
useEffect(() => {
  const testConnection = async () => {
    const { data, error } = await supabase.from('plans').select('count');
    console.log('Supabase connection:', { data, error });
  };
  testConnection();
}, []);
```

## Next Steps

1. Replace all mock data with Supabase queries
2. Add authentication with Supabase Auth
3. Implement real-time subscriptions for live updates
4. Add file upload for images and videos using Supabase Storage
5. Implement proper RLS policies for security