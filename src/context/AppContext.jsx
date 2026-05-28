import { createContext, useEffect, useState } from "react";

export const AppContext = createContext();

export default function AppProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function getUser() {
        try {
            const res = await fetch("/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            if (res.ok) {
                setUser(data);
            } else {
                setToken(null);
                localStorage.removeItem("token");
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            getUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    return (
        <AppContext.Provider value={{ token, setToken, user, setUser, loading }}>
            {children}
        </AppContext.Provider>
    );
}
