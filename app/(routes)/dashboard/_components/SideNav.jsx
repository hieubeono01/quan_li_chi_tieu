"use client";
import Image from "next/image";
import React from "react";
import { LayoutGrid, PiggyBank, ReceiptText, ShieldCheck, Target, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import UserButton from "./userButton";
import { useTheme } from "../../../_context/ThemeContext";

function SideNav({ onClose }) {
  const { isDarkMode } = useTheme();
  const menuList = [
    {
      id: 1,
      name: "Trang Chu",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      id: 2,
      name: "Thu nhập",
      icon: Wallet,
      path: "/dashboard/thu-nhap",
    },
    {
      id: 3,
      name: "Ngan Sach",
      icon: PiggyBank,
      path: "/dashboard/ngan-sach",
    },
    {
      id: 4,
      name: "Chi Phi",
      icon: ReceiptText,
      path: "/dashboard/chi-phi",
    },
    {
      id: 5,
      name: "Chi Phi",
      icon: Target,
      path: "/dashboard/muc-tieu",
    },
    {
      id: 6,
      name: "Nang Cap",
      icon: ShieldCheck,
      path: "/dashboard/thanh-toan",
    },
  ];

  const path = usePathname();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`h-screen p-5 border shadow-sm ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"} transition-colors duration-200`}>
      <Image src="/logoMira.png" alt="logo" width={200} height={200} />
      <div className="mt-5">
        {menuList.map((menu) => (
          <Link href={menu.path} key={menu.id} onClick={handleLinkClick}>
            <h2
              className={`
              flex gap-2 items-center
              font-medium p-5
              cursor-pointer rounded-md
              transition-colors duration-200
              ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-blue-100"}
              ${path === menu.path && (isDarkMode ? "bg-gray-700 text-white" : "bg-blue-100 text-primary")}
            `}
            >
              <menu.icon />
              {menu.name}
            </h2>
          </Link>
        ))}
      </div>
      <div className={`fixed bottom-10 p-5 flex gap-2 items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        <UserButton /> Profile
      </div>
    </div>
  );
}

export default SideNav;
