# ID Verification Database Schema & Integration

This document outlines the Supabase database structure and the JavaScript code required to interact with it.

## 1. Database Schema (PostgreSQL)

The following schema was executed to set up the foundational tables, relationships, and security policies.

```sql
-- 1. Profiles (Extends Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ID Submissions
CREATE TABLE id_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    extracted_text TEXT,
    detected_type TEXT,
    verification_status TEXT DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reference_id TEXT UNIQUE DEFAULT 'OJA' || floor(random() * 1000000000)::text,
    full_name TEXT NOT NULL,
    dob DATE,
    address TEXT,
    status TEXT DEFAULT 'draft',
    progress_step INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activity Logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Row Level Security (RLS)

All tables are protected by RLS policies ensuring users can only access their own data.

| Table | Policy Name | Permission | Condition |
| :--- | :--- | :--- | :--- |
| **profiles** | View Own | SELECT | `auth.uid() = id` |
| **profiles** | Update Own | UPDATE | `auth.uid() = id` |
| **id_submissions** | Insert Own | INSERT | `auth.uid() = user_id` |
| **id_submissions** | View Own | SELECT | `auth.uid() = user_id` |
| **applications** | CRUD Own | ALL | `auth.uid() = user_id` |
| **activity_logs** | Insert Own | INSERT | `auth.uid() = user_id` |

---

## 3. Client-Side Integration (JS/Supabase)

### Insert Submission & Log Activity
```javascript
const uploadAndLog = async (file, userId) => {
  // 1. Upload to Storage
  const { data: storageData } = await supabase.storage
    .from('ids')
    .upload(`${userId}/${Date.now()}.jpg`, file);

  const publicUrl = supabase.storage.from('ids').getPublicUrl(storageData.path).data.publicUrl;

  // 2. Insert Submission Record
  const { data: submission } = await supabase
    .from('id_submissions')
    .insert({
      user_id: userId,
      image_url: publicUrl,
      verification_status: 'pending'
    })
    .select()
    .single();

  // 3. Log the Activity
  await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      action: 'uploaded_id',
      metadata: { submission_id: submission.id }
    });
    
  return submission;
};
```

### Update Verification Results
```javascript
const updateVerification = async (submissionId, results) => {
  const { data } = await supabase
    .from('id_submissions')
    .update({
      extracted_text: results.text,
      detected_type: results.type,
      verification_status: results.isValid ? 'valid' : 'invalid'
    })
    .eq('id', submissionId);
    
  return data;
};
```

### Fetch User Progress
```javascript
const getProgress = async (userId) => {
  const { data } = await supabase
    .from('applications')
    .select('status, progress_step, reference_id')
    .eq('user_id', userId)
    .single();
    
  return data;
};
```

---

## 4. Performance Optimizations
- **Indexes**: Created on `user_id`, `reference_id`, `verification_status`, and `created_at`.
- **Triggers**: Automatic `profiles` row creation upon auth registration via PostgreSQL trigger.
