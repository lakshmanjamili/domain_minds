import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)', // Protect all routes except static files and _next
  ],
}; 