import { generateToken } from '../utils/jwt.js';

export class AuthService {
  buildTokenForUser(user) {
    return generateToken({ id: user._id.toString(), role: user.role });
  }
}
