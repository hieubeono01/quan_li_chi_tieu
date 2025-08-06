"use client"; // Bắt buộc để sử dụng Client Component

import { SnackbarProvider } from "notistack";

export default function SnackbarWrapper({ children }) {
    return (
        <SnackbarProvider
            maxSnack={3} // Số lượng thông báo tối đa hiển thị cùng lúc
            anchorOrigin={{ vertical: "bot", horizontal: "left" }} // Vị trí hiển thị Snackbar
        >
            {children}
        </SnackbarProvider>
    );
}
