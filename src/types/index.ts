// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  joinedDate: Date;
  avatar?: string;
}

// Post interface
export interface Post {
  id: string;
  userId: string;
  name: string;
  username: string;
  content: string;
  imageUrl?: string; // ✅ optional imageUrl
  likes: string[];
  comments: {
    id: string;
    userId: string;
    name: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: Date;
}


// Comment interface
export interface Comment {
  id: string;
  userId: string;
  username: string;
  name: string;
  content: string;
  createdAt: Date;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// Signup form data
export interface SignupData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Theme context type
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}