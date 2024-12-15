"use client";
import * as React from "react";
import { IdTokenResult, onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";
import { AuthContext, User } from "./AuthContext";
import { getFirebaseAuth } from "./firebase";
import { login, logout } from "../../api";
import { setUserData } from "../../services/auth.service";
import { useSearchParams } from "next/navigation";
// import { getUserBalance, getUserBalanceSnapshot } from "@/services/historyTransaction.service";
import { DocumentSnapshot, QuerySnapshot } from "firebase/firestore/lite";
// import { findUser } from "@/services/user.service";

export interface AuthProviderProps {
  serverUser: User | null;
  children: React.ReactNode;
}

function toUser(user: FirebaseUser, idTokenResult: IdTokenResult): User {
  return {
    ...user,
    emailVerified: user.emailVerified || (idTokenResult.claims.email_verified as boolean),
    customClaims: filterStandardClaims(idTokenResult.claims),
    authTime: toAuthTime(idTokenResult.issuedAtTime),
  };
}

function toAuthTime(date: string) {
  return new Date(date).getTime() / 1000;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({ serverUser, children }) => {
  const [user, setUser] = React.useState(serverUser);
  const searchParams = useSearchParams();
  // const refID = searchParams?.get("refID");
  let unsubscribeGetUserBalanceSnapshot: any = null;
  React.useEffect(() => {
    if (user === serverUser) {
      return;
    }
    setUser(serverUser);
  }, [serverUser]);
  // React.useEffect(() => {
  //   if (!!serverUser?.uid && !!user) {
  //     unsubscribeGetUserBalanceSnapshot = getUserBalanceSnapshot(user.uid, (snapshot: QuerySnapshot) => {
  //       const docs = snapshot.docs;
  //       user.balance = docs.reduce((sum, item) => sum + item.data()?.amount, 0) ?? 0;
  //       setUser({ ...user });
  //     });
  //   }
  // }, []);

  const handleLogout = async () => {
    if (!user) {
      return;
    }

    await logout();
    window.location.href = "/";
  };

  const handleLogin = async (firebaseUser: FirebaseUser) => {
    const idTokenResult = await firebaseUser.getIdTokenResult();
    if (user?.authTime && user.authTime >= toAuthTime(idTokenResult.issuedAtTime)) {
      return;
    }
    const decodedUser = toUser(firebaseUser, idTokenResult);
    await login(idTokenResult.token);
    const res = await setUserData(decodedUser);
    decodedUser.userInfo = res.userInfo;
    // console.log(decodedUser)
    // if(!res.isNewUser){

    // }else{
    //   decodedUser.
    // }
    setUser(decodedUser);
  };

  const handleIdTokenChanged = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      await handleLogout();
      return;
    }
    await handleLogin(firebaseUser);

    // if (!!user?.uid) {
    //   const fetchedUser = await findUser(user.uid);
    //   if (!!fetchedUser?.createdDate?.seconds) {
    //     fetchedUser.createdDate = fetchedUser.createdDate.seconds * 1000;
    //   }
    //   if (!!fetchedUser?.dateOfBirth?.seconds) {
    //     fetchedUser.dateOfBirth = fetchedUser.dateOfBirth.seconds * 1000;
    //   }
    //   if (!!fetchedUser?.dateOfFirstIssue?.seconds) {
    //     fetchedUser.dateOfFirstIssue = fetchedUser.dateOfFirstIssue.seconds * 1000;
    //   }
    //   user.userInfo = fetchedUser;
    //   user.balance = await getUserBalance(user.uid);
    //   setUser({ ...user });
    //   const unsubscribeGetUserByIDSnapshot = getUserByIDSnapshot(user.uid, (snapshot: DocumentSnapshot) => {
    //     if (snapshot.exists()) {
    //       const fetchedUser = snapshot.data();
    //       if (!!fetchedUser?.createdDate?.seconds) {
    //         fetchedUser.createdDate = fetchedUser.createdDate.seconds * 1000;
    //       }
    //       if (!!fetchedUser?.dateOfBirth?.seconds) {
    //         fetchedUser.dateOfBirth = fetchedUser.dateOfBirth.seconds * 1000;
    //       }
    //       if (!!fetchedUser?.dateOfFirstIssue?.seconds) {
    //         fetchedUser.dateOfFirstIssue = fetchedUser.dateOfFirstIssue.seconds * 1000;
    //       }
    //       user.userInfo = fetchedUser;
    //       setUser({ ...user });
    //     }
    //   });
    //   const unsubscribeGetUserBalanceSnapshot = getUserBalanceSnapshot(user.uid, (snapshot: QuerySnapshot) => {
    //     const docs = snapshot.docs;
    //     if (docs?.length > 0) {
    //       user.balance = docs.reduce((sum, item) => sum + item.data()?.amount, 0) ?? 0;
    //       setUser({ ...user });
    //     }
    //   });
    // }
  };

  React.useEffect(() => {
    return onIdTokenChanged(getFirebaseAuth(), handleIdTokenChanged);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {((!!user?.uid && !!user.userInfo) || !user?.uid) && children}
    </AuthContext.Provider>
  );
};
