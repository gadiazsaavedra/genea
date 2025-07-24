const postgres = require('postgres');

const sql = postgres('postgresql://postgres:QLkHhCQ6JCrqDcsE@db.hsdjbqqijtxehepifbfk.supabase.co:5432/postgres');

const createTables = async () => {
  try {
    await sql`
      CREATE TABLE families (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    console.log('Table "families" created successfully!');

  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await sql.end();
  }
};

createTables();
