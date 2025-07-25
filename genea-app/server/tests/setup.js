// Mock Supabase for testing
jest.mock('../src/config/supabase.config', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  },
  supabaseAdmin: {
    auth: {
      admin: {
        getUserById: jest.fn(() => Promise.resolve({ 
          data: { user: { id: '123', email: 'test@test.com' } }, 
          error: null 
        }))
      }
    }
  }
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: '123' }))
  }))
}));