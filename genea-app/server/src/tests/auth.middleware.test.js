const authMiddleware = require('../middleware/auth.middleware');
const authService = require('../services/auth.service');
const { supabaseAdmin } = require('../config/supabase.config');

jest.mock('../services/auth.service');
jest.mock('../config/supabase.config');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {
        authorization: 'Bearer test-token',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('debería pasar al siguiente middleware si el token es válido y el usuario existe', async () => {
    const decodedToken = { uid: 'test-uid' };
    const user = {
      id: 'test-uid',
      email: 'test@example.com',
      user_metadata: { displayName: 'Test User' },
    };

    authService.verifyToken.mockReturnValue(decodedToken);
    supabaseAdmin.auth = {
      admin: {
        getUserById: jest.fn().mockResolvedValue({ data: { user } }),
      },
    };

    await authMiddleware(req, res, next);

    expect(authService.verifyToken).toHaveBeenCalledWith('test-token');
    expect(supabaseAdmin.auth.admin.getUserById).toHaveBeenCalledWith('test-uid');
    expect(req.user).toEqual({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      emailVerified: false,
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('debería devolver un error 401 si no hay token de autorización', async () => {
    req.headers.authorization = undefined;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No autorizado, token no proporcionado',
    });
    expect(next).not.toHaveBeenCalled();
  });
});