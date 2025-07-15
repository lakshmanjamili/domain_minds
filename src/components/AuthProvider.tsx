// TODO: Add Clerk <ClerkProvider> here for authentication
// import { ClerkProvider } from '@clerk/nextjs';
// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   return <ClerkProvider>{children}</ClerkProvider>;
// }

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children; 