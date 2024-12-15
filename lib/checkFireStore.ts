import { db, auth } from "../firebase/client-config";
import { collection, getDocs } from "firebase/firestore";

// Kiểm tra kết nối Firestore
async function checkFirestoreConnection() {
  try {
    console.log("🔍 Đang kiểm tra kết nối Firestore...");

    // Bạn có thể thay 'users' bằng tên collection thực tế của bạn
    const usersRef = collection(db, "budgets");
    const snapshot = await getDocs(usersRef);

    console.log("✅ Kết nối Firestore thành công!");
    console.log(`Số documents trong collection: ${snapshot.size}`);

    // In ra từng document nếu muốn
    snapshot.forEach((doc) => {
      console.log("Document ID:", doc.id);
      console.log("Document Data:", doc.data());
    });
  } catch (error) {
    console.error("❌ Lỗi kết nối Firestore:", error);
  }
}

// Kiểm tra kết nối Authentication
function checkAuthConnection() {
  try {
    console.log("🔍 Đang kiểm tra kết nối Authentication...");

    const currentUser = auth.currentUser;

    if (currentUser) {
      console.log("✅ Đã đăng nhập:", currentUser.email);
    } else {
      console.log("ℹ️ Chưa có user nào đăng nhập");
    }
  } catch (error) {
    console.error("❌ Lỗi kết nối Authentication:", error);
  }
}

// Gọi các hàm kiểm tra
