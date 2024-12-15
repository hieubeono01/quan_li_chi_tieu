"use client";

import Image from "next/image";
import React from "react";
import UserButton from "../(routes)/dashboard/_components/userButton";
import { auth } from "../../firebase/firebase_app"; // Đường dẫn đến firebaseConfig.ts
import { Button } from "../../components/ui/button"; // Đảm bảo bạn có component Button
import Link from "next/link";

function Header() {
  const user = auth.currentUser; // Lấy thông tin người dùng hiện tại

  return (
    <div className="p-5 flex justify-between items-center border shadow-sm">
      <Image src="/logo.png" alt="logo" width={50} height={50} />
      {user ? ( // Kiểm tra nếu có người dùng hiện tại
        <UserButton />
      ) : (
        <Link href={"/xac-thuc"}>
          <button className="block w-full rounded bg-red-600 px-4 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto">Get Started</button>
        </Link>
      )}
    </div>
  );
}

export default Header;
