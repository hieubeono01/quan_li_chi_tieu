'use client'
import Image from 'next/image'
import React, { useEffect } from 'react'
import {LayoutGrid, PiggyBank, ReceiptText, ShieldCheck, Wallet} from 'lucide-react'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import UserButton from './userButton';
function SideNav() {
    const menuList = [
      {
        id: 1,
        name: "Trang Chu",
        icon: LayoutGrid,
        path: "/dashboard",
      },
      {
        id: 2,
        name: "Thu nhập",
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
        name: "Nang Cap",
        icon: ShieldCheck,
        path: "/dashboard/thanh-toan",
      },
    ];
    const path =usePathname(); 
    useEffect(()=> {
        console.log(path)
    },[path])
    // const currentPath = usePathname();
  return (
    <div className="h-screen p-5 border shadow-sm">
      <Image src={"/logo.png"} alt="logo" width={50} height={50} />
      <div className="mt-5">
        {menuList.map((menu, index) => (
          <Link href={menu.path} key={menu.id}>
            <h2 className={`flex gap-2 items-center text-gray-500 font-medium p-5 cursor-pointer rounded-md hover:text-primary hover:bg-blue-100 ${path === menu.path && "text-primary bg-blue-100"}`}>
              <menu.icon />
              {menu.name}
            </h2>
          </Link>
        ))}
      </div>
      <div className='fixed bottom-10 p-5 flex gap-2 items-center'><UserButton/> Profile</div>
    </div>
  );
}

export default SideNav