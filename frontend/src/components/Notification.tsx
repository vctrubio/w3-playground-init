import React from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { Notification as NotificationType } from "../lib/types";

const Notification: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  const getTypeStyles = (type: NotificationType["type"]) => {
    switch (type) {
      case "error":
        return "bg-red-900 border-red-950 text-red-100";
      case "warning":
        return "bg-amber-800 border-amber-900 text-amber-100";
      case "success":
        return "bg-emerald-800 border-emerald-900 text-emerald-100";
      default:
        return "bg-blue-900 border-blue-950 text-blue-100";
    }
  };

  return (
    <div className="absolute top right-5 z-50 flex flex-col items-end">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getTypeStyles(notification.type)} p-3 rounded-md shadow-lg 
          border mb-3 flex justify-between items-center 
          animate-slideIn max-w-xs backdrop-blur-sm bg-opacity-90`}
        >
          <p className="text-sm">{notification.message}</p>
          <button
            onClick={() => notification.id && removeNotification(notification.id)}
            className="ml-2 hover:opacity-70 focus:outline-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;
