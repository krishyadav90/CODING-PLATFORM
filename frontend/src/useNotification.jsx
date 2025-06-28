import { useState } from "react";

function useNotification() {
  const [notification, setNotification] = useState({ message: "", type: "info" });

  const showNotification = (message, type = "info") => {
    console.log("showNotification called:", { message, type });
    setNotification({ message, type });
  };

  const clearNotification = () => {
    console.log("clearNotification called");
    setNotification({ message: "", type: "info" });
  };

  return { notification, showNotification, clearNotification };
}

export default useNotification;