import jwt from 'jsonwebtoken';

const generateToken = (
  id: string | number,
  role?: string,
  email?: string
): string => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET || 'default_secret_key',
    {
    expiresIn: '30d',
    }
  );
};

export default generateToken;
