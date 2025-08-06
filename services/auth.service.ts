// import { MISSION_STATUS, SYSTEM_MISSION } from "@/app/(mission)/components/constant";
import { getFirebaseApp } from "../src/app/auth/firebase";
import { ConfirmationResult, FacebookAuthProvider, getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup, UserCredential } from "firebase/auth";
import { getFirestore, doc, getDoc, Timestamp, setDoc, collection, query, where, getDocs } from "firebase/firestore/lite";
// import { insertEarning } from "./historyEarning.client.service";
import { User as FirebaseUser } from "firebase/auth";
// import { getUserIDByRefCode } from "./user.service";

const auth = getAuth(getFirebaseApp());
const db = getFirestore(getFirebaseApp());

export enum ACCOUNT_TYPES {
  GOOGLE = "google.com",
  FACEBOOK = "facebook.com",
  PHONE = "phone",
}

export const phoneAuth = (submitButtonId: string, phoneNumber: string) => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, submitButtonId, {
    size: "invisible",
  });
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export const verifyOtp = (confirmationResult: ConfirmationResult, otp: string) => {
  return confirmationResult.confirm(otp);
};
export const setUserData = async (user: any) => {
   console.log("Entering setUserData()");
   console.log("user:", user);
  //  console.log("refCode:", );
  const userRef = doc(db, `users`, user?.uid);
  console.log("users",userRef)
  const userData = (await getDoc(userRef))?.data();
  console.log("userData:", userData);
  let isNewUser = false;
  if (!userData?.id) {
    isNewUser = true;
    console.log("User is new");
    let providerId;
    try {
      providerId = user?.providerData?.[0]?.providerId ?? user?.providerId ?? "unknown";
    } catch (error) {
      providerId = user.providerId;
    }
    const data: any = {
      id: user.uid,
      auth: {
        providerId,
      },
      createdDate: Timestamp.now(),
      status: 0,
    };
    console.log("user id", user.uid);
    // tìm người giới thiệu trong trường hợp có refCode truyền vào
    // if (!!refCode) {
    //   const refID = await getUserIDByRefCode(refCode);
    //   if (!!refID) {
    //     // trường hợp tìm được user ID dựa trên refCode
    //     data.refID = refID;
    //   }
    // }
    // try {
    //   data.contacts = {};
    //   if (user?.phoneNumber) {
    //     data.contacts.phone = [user.phoneNumber];
    //     data.phoneNumber = user.phoneNumber;
    //   }
    //   if (user?.email) {
    //     data.contacts.email = [user.email];
    //     data.email = user.email;
    //   }

    // } catch (error) {}
    switch (providerId) {
      case ACCOUNT_TYPES.GOOGLE: {
        data.auth.username = user.email;
        data.email = user.email;
        break;
      }
      case ACCOUNT_TYPES.PHONE: {
        data.phoneNumber = user.phoneNumber;
        data.auth.username = user.phoneNumber;
        break;
      }
      default:
        break;
    }
    await setDoc(userRef, data, {
      merge: true,
    });
    // try {
    //   const mission: any = SYSTEM_MISSION.find((item) => item.key === "REGISTER");
    //   await insertEarning(user.uid, mission.key, mission.key, mission?.type, MISSION_STATUS.COMPLETED, mission?.amount, null);
    // } catch (err) {
    //   console.log(err);
    // }
    // window.location.reload();
    return user.uid;
  }
  return {
    isNewUser,
    userInfo: userData,
  };
};

const authLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
  try {
    const result = await signInWithPopup(auth, provider);

    // const isAccountDisabled = await checkAccountStatus(result.user.uid);

    // if (isAccountDisabled) {
    //   await auth.signOut();
    //   throw new Error("Tài khoản đã bị vô hiệu hóa.");
    // }

    return result;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    throw error;
  }
};

export const googleAuth = async () => {
  return await authLogin(new GoogleAuthProvider());
};

export const facebookAuth = async () => {
  return await authLogin(new FacebookAuthProvider());
};

export const signOut = async () => {
  return await auth.signOut();
};
