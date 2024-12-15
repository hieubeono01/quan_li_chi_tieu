"use client";

import React, { useState } from "react";
import { Avatar, Menu, MenuItem, Button } from "@mui/material";
import { auth } from "../../../../firebase/firebase_app"; // Đường dẫn tới file firebaseConfig.ts
import { signOut } from "firebase/auth";

function UserButton() {
  const user = auth.currentUser; // Lấy thông tin người dùng hiện tại
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Đăng xuất thành công");
        setAnchorEl(null);
      })
      .catch((error) => {
        console.error("Lỗi khi đăng xuất:", error);
      });
  };

  if (!user) return null;

  return (
    <div>
      <Button onClick={handleMenuOpen}>
        <Avatar alt="Avatar" src={user.photoURL || "/img/default-avatar.png"} />
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>{user.displayName || "User"}</MenuItem>
        <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
      </Menu>
    </div>
  );
}

export default UserButton;
