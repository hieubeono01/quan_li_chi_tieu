"use client";

import React, { useState, useEffect } from "react";
import { Avatar, Menu, MenuItem, Button, Skeleton } from "@mui/material";
import { auth } from "../../../../../firebase/firebase_app";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

function UserButton() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái authentication
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleMenuClose();
      router.push("/xac-thuc");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  // Show loading state
  if (loading) {
    return <Skeleton variant="circular" width={40} height={40} className="ml-2" />;
  }

  // Nếu không có user, return null sớm
  if (!user) {
    router.push("/xac-thuc");
    return null;
  }

  return (
    <div className="relative">
      <Button onClick={handleMenuOpen} className="min-w-0 p-0">
        <Avatar alt={user.displayName || "User"} src={user.photoURL || "/img/default-avatar.png"} className="w-10 h-10" />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleMenuClose}>{user.displayName || "User"}</MenuItem>
        <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
      </Menu>
    </div>
  );
}

export default React.memo(UserButton);
