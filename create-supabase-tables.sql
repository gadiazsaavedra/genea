-- =============================================
-- GENEA DATABASE SCHEMA FOR SUPABASE
-- Execute this in Supabase SQL Editor
-- =============================================

-- 1. FAMILIES TABLE
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. PEOPLE TABLE (persons)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  maiden_name VARCHAR(255),
  birth_date DATE,
  death_date DATE,
  birth_place VARCHAR(255),
  death_place VARCHAR(255),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  biography TEXT,
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. RELATIONSHIPS TABLE
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person1_id UUID REFERENCES people(id) ON DELETE CASCADE,
  person2_id UUID REFERENCES people(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL,
  marriage_date DATE,
  divorce_date DATE,
  marriage_place VARCHAR(255),
  is_current_spouse BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. MEDIA TABLE
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. FAMILY_MEMBERS TABLE
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW()
);

-- 6. COMMENTS TABLE
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_photo_url VARCHAR(500),
  text TEXT NOT NULL,
  mentions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. INVITATIONS TABLE
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_people_family_id ON people(family_id);
CREATE INDEX idx_relationships_person1 ON relationships(person1_id);
CREATE INDEX idx_relationships_person2 ON relationships(person2_id);
CREATE INDEX idx_media_person_id ON media(person_id);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_comments_media_id ON comments(media_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_invitations_token ON invitations(token);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- BASIC SECURITY POLICIES
-- =============================================

-- Families policies
CREATE POLICY "Users can view their families" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- People policies
CREATE POLICY "Users can view people from their families" ON people
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Family members policies
CREATE POLICY "Users can view family members" ON family_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can view comments" ON comments
  FOR SELECT USING (
    media_id IN (
      SELECT m.id FROM media m 
      JOIN people p ON m.person_id = p.id 
      JOIN family_members fm ON p.family_id = fm.family_id 
      WHERE fm.user_id = auth.uid()
    )
  );

-- Media policies
CREATE POLICY "Users can view media from their families" ON media
  FOR SELECT USING (
    person_id IN (
      SELECT p.id FROM people p 
      JOIN family_members fm ON p.family_id = fm.family_id 
      WHERE fm.user_id = auth.uid()
    )
  );

-- Relationships policies
CREATE POLICY "Users can view relationships from their families" ON relationships
  FOR SELECT USING (
    person1_id IN (
      SELECT p.id FROM people p 
      JOIN family_members fm ON p.family_id = fm.family_id 
      WHERE fm.user_id = auth.uid()
    )
  );

-- Invitations policies
CREATE POLICY "Users can view their invitations" ON invitations
  FOR SELECT USING (
    invited_by = auth.uid() OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );