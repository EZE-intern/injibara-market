import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'MIKAEL_ARTETA_ARSENAL';

const generateToken = (
  id: string | number,
  role?: string,
  email?: string
): string => {
  return jwt.sign(
    { id, role, email },
    JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

export default generateToken;
