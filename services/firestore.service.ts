// firestore.service.ts
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/client-config"; // Giả sử bạn đã cấu hình Firebase ở đây

export async function testSaveUserData() {
  const userRef = doc(db, "users", "test-user-id");
  await setDoc(userRef, {
    name: "John Doe",
    email: "john.doe@example.com",
    createdAt: new Date(),
  });
  console.log("User data saved to Firestore");
}
