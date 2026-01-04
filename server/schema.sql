-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ⚠️ WARNING: This will delete all existing data!
drop table if exists loans cascade;
drop table if exists books cascade;
drop table if exists profiles cascade;

-- 1. PROFILES (Public profile data for auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  role text default 'user', -- 'user' or 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. BOOKS
create table books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author text not null,
  category text not null,
  year integer,
  isbn text,
  status text default 'Available', -- 'Available', 'Borrowed'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. LOANS
create table loans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  book_id uuid references books(id) not null,
  loan_date date not null,
  return_date date not null,
  status text default 'Active', -- 'Active', 'Returned'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table books enable row level security;
alter table loans enable row level security;

-- Policies for PROFILES
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Policies for BOOKS
-- Admins can do everything, Users can only view
create policy "Books are viewable by everyone." on books for select using (true);
create policy "Admins can insert books." on books for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update books." on books for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete books." on books for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Policies for LOANS
-- Users see own loans, Admins see all
create policy "Users view own loans, Admins view all." on loans for select using (
  auth.uid() = user_id or 
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users insert own loans." on loans for insert with check (auth.uid() = user_id);
create policy "Users update own loans, Admins update all." on loans for update using (
  auth.uid() = user_id or 
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 5. AUTOMATIC PROFILE CREATION TRIGGER
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. SEED DATA (Books only, users are created via Auth)
insert into books (title, author, category, year, isbn, status) values
('Clean Code', 'Robert C. Martin', 'Technology', 2008, '978-0132350884', 'Available'),
('The Pragmatic Programmer', 'Andrew Hunt', 'Technology', 1999, '978-0201616224', 'Available'),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 1925, '978-0743273565', 'Available');
