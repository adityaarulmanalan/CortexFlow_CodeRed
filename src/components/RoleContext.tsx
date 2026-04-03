"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Role, User } from "@/lib/store";

interface RoleContextType {
  role: Role;
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  currentUser: string; // Maintain compatibility for existing UI
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const login = (userData: User) => {
    setUser(userData);
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    router.push("/login");
  };

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, pathname, router]);

  return (
    <RoleContext.Provider value={{ 
      role: user?.role || "manager", 
      user, 
      isLoggedIn: !!user, 
      login, 
      logout,
      currentUser: user?.name || ""
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
