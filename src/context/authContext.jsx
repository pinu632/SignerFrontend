import { createContext } from "react";
import { useContext } from "react";
import { useState ,useEffect} from "react";
import baseUrl from "../../config";
import axios from "axios";

const AuthContext = createContext()

export const authContext = () => useContext(AuthContext)




export function AuthProvider({children}){
     const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set axios to send cookies with requests
  axios.defaults.withCredentials = true;

  // Fetch current user from backend (e.g., /api/auth/me)
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl}/auth/me`);
      console.log(res) // assumes backend reads cookie and returns user
      setUser(res.data.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(); // Run on mount
  }, []);

  const logout = async () => {
    await axios.post('/api/auth/logout'); // backend clears cookie
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    logout,
    refreshUser: fetchUser, // useful after login
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}