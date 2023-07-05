import toastImpl, { ToastHandler } from "solid-toast";

interface CustomToast {
  success: ToastHandler;
  error: ToastHandler;
}

const toast: CustomToast = {
  success: (message: Parameters<ToastHandler>[0]) => {
    return toastImpl.success(message, {
      iconTheme: {
        primary: "white",
        secondary: "hsl(var(--su))",
      },
      style: {
        background: "hsl(var(--su))",
        color: "white",
      },
    });
  },
  error: (message: Parameters<ToastHandler>[0]) => {
    return toastImpl.error(message, {
      iconTheme: {
        primary: "white",
        secondary: "hsl(var(--er))",
      },
      style: {
        background: "hsl(var(--er))",
        color: "white",
      },
    });
  },
};

export default toast;
