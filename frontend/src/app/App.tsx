import { AppRoutes } from '@/routes'

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  console.log("API URL:", API_URL);
  return <AppRoutes />
}

