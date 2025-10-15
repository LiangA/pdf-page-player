-- Create app_role enum for the user_roles table
CREATE TYPE app_role AS ENUM ('client', 'consultant', 'admin');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- PROFILES TABLE POLICIES
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Consultants can read their assigned clients' profiles
CREATE POLICY "Consultants can read assigned clients" ON profiles
FOR SELECT USING (
  public.has_role(auth.uid(), 'consultant') AND
  id IN (SELECT client_id FROM appointments WHERE consultant_id = auth.uid())
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger on signup)
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- INQUIRIES TABLE POLICIES
-- Only consultants and admins can read inquiries
CREATE POLICY "Consultants and admins can read inquiries" ON inquiries
FOR SELECT USING (
  public.has_role(auth.uid(), 'consultant') OR
  public.has_role(auth.uid(), 'admin')
);

-- Anyone can create an inquiry (public form submission)
CREATE POLICY "Anyone can create inquiry" ON inquiries
FOR INSERT WITH CHECK (true);

-- Consultants and admins can update inquiries
CREATE POLICY "Consultants and admins can update inquiries" ON inquiries
FOR UPDATE USING (
  public.has_role(auth.uid(), 'consultant') OR
  public.has_role(auth.uid(), 'admin')
);

-- APPOINTMENTS TABLE POLICIES
-- Users and consultants can read appointments they're involved in
CREATE POLICY "Users can read own appointments" ON appointments
FOR SELECT USING (
  auth.uid() = client_id OR
  auth.uid() = consultant_id
);

-- Consultants can create appointments
CREATE POLICY "Consultants can create appointments" ON appointments
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'consultant') AND
  auth.uid() = consultant_id
);

-- Involved parties can update appointments (for cancellation)
CREATE POLICY "Involved parties can update appointments" ON appointments
FOR UPDATE USING (
  auth.uid() = client_id OR
  auth.uid() = consultant_id
);

-- FINANCIAL_NEEDS_ANALYSIS TABLE POLICIES
-- Users can read their own FNA
CREATE POLICY "Users can read own FNA" ON financial_needs_analysis
FOR SELECT USING (auth.uid() = client_id);

-- Consultants can read FNA of their assigned clients
CREATE POLICY "Consultants can read assigned clients FNA" ON financial_needs_analysis
FOR SELECT USING (
  public.has_role(auth.uid(), 'consultant') AND
  client_id IN (SELECT client_id FROM appointments WHERE consultant_id = auth.uid())
);

-- Users can insert their own FNA
CREATE POLICY "Users can insert own FNA" ON financial_needs_analysis
FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Users can update their own FNA
CREATE POLICY "Users can update own FNA" ON financial_needs_analysis
FOR UPDATE USING (auth.uid() = client_id);

-- Update the handle_new_user function to create default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'client'
  );
  
  -- Insert default role into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'client');
  
  RETURN new;
END;
$$;