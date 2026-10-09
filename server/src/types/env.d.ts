export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  WORKOS_API_KEY?: string;
  WORKOS_CLIENT_ID?: string;
  WORKOS_REDIRECT_URI?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  INITIAL_ADMIN_EMAILS?: string;
  ENVIRONMENT?: string;
}
