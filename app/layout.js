import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import SnackbarWrapper from "../app/_components/SnackbarWrapper"

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Mira - Theo dõi chi tiêu, quản lý thu nhập, tự động phân bổ nguồn lực theo phương pháp 6 Jars.",
  description:
    "Ứng dụng quản lý chi tiêu cá nhân thông minh, giúp bạn theo dõi thu nhập, kiểm soát chi phí và đạt được mục tiêu tài chính dễ dàng hơn bao giờ hết.",
  icons: [
    { rel: "icon", type: "image/png", url: "/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/logo.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", url: "/logo.png" },
    { rel: "apple-touch-icon", type: "image/png", sizes: "180x180", url: "/metadata/apple-touch-icon.png" },
    { rel: "android-chrome", type: "image/png", sizes: "192x192", url: "/metadata/android-chrome-192x192.png" },
    { rel: "android-chrome", type: "image/png", sizes: "512x512", url: "/metadata/android-chrome-512x512.png" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <SnackbarWrapper>
          {children}
        </SnackbarWrapper>
      </body>
    </html>
  );
}
