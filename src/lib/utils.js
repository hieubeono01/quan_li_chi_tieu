import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export async function exitInAppBrowser(url) {
  try {
    const standalone = window.navigator.standalone,
      userAgent = window.navigator.userAgent.toLowerCase(),
      safari = /safari/.test(userAgent),
      isIOS = /iphone|ipod|ipad/.test(userAgent);
    const isAndroid = /android/.test(userAgent),
      isWebView = /wv/.test(userAgent) || /webview/.test(userAgent),
      isPWA = window.matchMedia("(display-mode: standalone)").matches;

    // Kiểm tra WebView trên iOS (nếu không có `window.navigator.standalone`)
    if (isIOS) {
      if (!safari && !standalone) {
        try {
          // Try safari - 15, 17, 18
          const iosUrl = `x-safari-${url}`;
          window.location.href = iosUrl;
        } catch (error) {
          try {
            // Try safari old way
            const iosOldUrl = `com-apple-mobilesafari-tab:${url}`;
            window.location.href = iosOldUrl;
          } catch (error) {
            try {
              // Try google chrome
              const chromeUrl = `googlechrome://${url
                ?.replace("https://", "")
                ?.replace("http://", "")}`;
              window.location.href = chromeUrl;
            } catch (error) {
              try {
                // Try firefox
                const firefoxUrl = `firefox://open-url?url=${url}`;
                window.location.href = firefoxUrl;
              } catch (error) {
                try {
                  // Default fallback
                  const iosSearchUrl = `x-web-search://?cicd.aitracuuluat.vn`;
                  window.location.href = iosSearchUrl;
                } catch (error) {
                  // Handle any further errors here if needed
                }
              }
            }
          }
        }
        return true;
      }
    } else if (isAndroid) {
      if (!!isWebView) {
        try {
          // Try chrome
          const androidIntent = `intent://${url.replace(
            "https://",
            ""
          )}#Intent;scheme=https;package=com.android.chrome;end;`;
          window.location.href = androidIntent;
        } catch (error) {
          try {
            // Try chrome alternative
            const chromeUrl = `googlechrome://navigate?url=${url}`;
            window.location.href = chromeUrl;
          } catch (error) {
            try {
              // Try firefox
              const firefoxUrl = `firefox://open-url?url=${url}`;
              window.location.href = firefoxUrl;
            } catch (error) {
              // Handle further errors
            }
          }
        }
        return true;
      }
    }

    return false; // Đang chạy trong trình duyệt đầy đủ
  } catch (error) {
    // console.log(error);
    return false;
  }
}


//Thêm data
async function addBudget(budgetName, budgetAmount) {
  try {
    // Tham chiếu đến collection "budgets"
    const budgetsRef = collection(db, "budgets");

    // Thêm document mới
    const docRef = await addDoc(budgetsRef, {
      name: budgetName,
      amount: budgetAmount,
      createdAt: new Date().toISOString(), // Lưu timestamp tạo
    });

    console.log("Thêm document thành công với ID:", docRef.id);
  } catch (error) {
    console.error("Lỗi khi thêm document:", error);
  }
}

