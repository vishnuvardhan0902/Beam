// This file contains type definitions for authentication
// Since we've converted to JavaScript, these are just kept for documentation purposes

// User structure
/*
User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isSeller: boolean
  avatar?: string
}
*/

// Auth context structure
/*
AuthContext {
  user: User | null
  loading: boolean
  error: string | null
  login: (email, password) => Promise<User>
  register: (name, email, password) => Promise<User>
  googleLogin: () => Promise<User>
  googleSignup: () => Promise<User>
  logout: () => void
  updateUserState: (userData) => void
  isAdmin: boolean
  isSeller: boolean
}
*/

// No exports needed for JavaScript 