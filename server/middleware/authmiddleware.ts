import {
  Request,
  Response,
  NextFunction,
} from 'express';

import jwt from 'jsonwebtoken';

/*
|--------------------------------------------------------------------------
| JWT USER
|--------------------------------------------------------------------------
*/

interface JwtUser {
  id: number;
  role: string;
  email: string;
}

/*
|--------------------------------------------------------------------------
| Protect
|--------------------------------------------------------------------------
| Verifies JWT and puts the authenticated user into req.user.
|--------------------------------------------------------------------------
*/

export const protect = (
  req: Request & {
    user?: JwtUser;
  },
  res: Response,
  next: NextFunction
) => {

  try {

    /*
    |--------------------------------------------------------------------------
    | Get Authorization header
    |--------------------------------------------------------------------------
    */

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        message:
          'እባክዎ መጀመሪያ Login ያድርጉ',
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Extract token
    |--------------------------------------------------------------------------
    */

    const token =
      authHeader
        .substring(7)
        .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication token is missing',
      });
    }

    /*
    |--------------------------------------------------------------------------
    | JWT secret
    |--------------------------------------------------------------------------
    */

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {

      console.error(
        'JWT_SECRET is not configured'
      );

      return res.status(500).json({
        success: false,
        message:
          'Server authentication configuration error',
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify token
    |--------------------------------------------------------------------------
    */

    const decoded =
      jwt.verify(
        token,
        secret
      ) as JwtUser;

    /*
    |--------------------------------------------------------------------------
    | Validate JWT payload
    |--------------------------------------------------------------------------
    */

    if (
      !decoded.id ||
      !decoded.role ||
      !decoded.email
    ) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid authentication token',
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Attach authenticated user
    |--------------------------------------------------------------------------
    */

    req.user = {
      id:
        Number(decoded.id),

      role:
        String(decoded.role)
          .trim()
          .toLowerCase(),

      email:
        String(decoded.email)
          .trim()
          .toLowerCase(),
    };

    /*
    |--------------------------------------------------------------------------
    | Debug
    |--------------------------------------------------------------------------
    */

    console.log(
      'AUTHENTICATED USER:',
      req.user
    );

    next();

  } catch (error: any) {

    console.error(
      'AUTH ERROR:',
      error?.message
    );

    return res.status(401).json({
      success: false,
      message:
        'Invalid or expired token',
    });
  }
};


/*
|--------------------------------------------------------------------------
| Alias
|--------------------------------------------------------------------------
*/

export const authenticateUser =
  protect;


/*
|--------------------------------------------------------------------------
| Authorize
|--------------------------------------------------------------------------
| Example:
|
| authorize('admin', 'seller')
|--------------------------------------------------------------------------
*/

export const authorize = (
  ...allowedRoles: string[]
) => {

  return (
    req: Request & {
      user?: JwtUser;
    },
    res: Response,
    next: NextFunction
  ) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          'Unauthorized: User information not found',
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize roles
    |--------------------------------------------------------------------------
    */

    const userRole =
      String(req.user.role)
        .trim()
        .toLowerCase();

    const normalizedAllowedRoles =
      allowedRoles.map(
        role =>
          String(role)
            .trim()
            .toLowerCase()
      );

    /*
    |--------------------------------------------------------------------------
    | Debug
    |--------------------------------------------------------------------------
    */

    console.log(
      'AUTHORIZATION:',
      {
        userRole,
        allowedRoles:
          normalizedAllowedRoles,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Check role
    |--------------------------------------------------------------------------
    */

    if (
      !normalizedAllowedRoles.includes(
        userRole
      )
    ) {

      return res.status(403).json({
        success: false,

        message:
          `Access denied: role "${userRole}" is not allowed`,

        role:
          userRole,

        allowedRoles:
          normalizedAllowedRoles,
      });
    }

    next();
  };
};
