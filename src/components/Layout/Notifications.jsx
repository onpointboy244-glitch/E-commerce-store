import { useRef } from "react";
import { useNotifications } from "../../Hooks/useNotifications";
import "../../styles/Header.css";

export function Notifications() {
  const {
    data: notifications,
    unreadCount,
    markAsRead,
    error,
  } = useNotifications();
  const hasMarkedRead = useRef(false);

  // Mark all as read when the dropdown opens (hover triggers display: block via CSS)
  // Use a ref-based guard to only fire once per open, not constantly while hovering
  const handleDropdownEnter = () => {
    if (hasMarkedRead.current) return;
    hasMarkedRead.current = true;
    notifications?.forEach((n) => !n.isRead && markAsRead(n.id));
  };

  // Reset the guard when leaving the whole container so next hover re-marks
  const handleContainerLeave = () => {
    hasMarkedRead.current = false;
  };

  return (
    <div
      className="notification-container position-relative"
      onMouseLeave={handleContainerLeave}
    >
      {unreadCount > 0 && (
        <span
          className="position-absolute badge rounded-pill bg-danger"
          style={{ zIndex: 10, top: "8px", right: "10px", fontSize: "0.65rem" }}
        >
          {unreadCount}
        </span>
      )}

      <i
        className="bi bi-bell-fill notification-icon"
        style={{ fontSize: "1.5rem", cursor: "pointer" }}
      ></i>

      <div
        className="notification-dropdown shadow-lg"
        onMouseEnter={handleDropdownEnter}
      >
        <div className="notify-header">Notifications </div>
        <div
          className="notify-list"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {notifications?.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notify-item border-bottom ${!n.isRead ? "unread" : ""}`}
              >
                <div className="notify-title">{n.title}</div>
                <div className="notify-body small">
                  {n.message.split(/(#\w+)/g).map((part, index) =>
                    part.startsWith("#") ? (
                      <span key={index} className="notify-id">
                        {part}
                      </span>
                    ) : (
                      part
                    ),
                  )}
                </div>
                <div
                  className="notify-time text-muted text-start"
                  style={{ fontSize: "0.7rem", marginBottom: "-15px" }}
                >
                  {(() => {
                    if (!n.timestamp) return "just now";
                    const date = n.timestamp.toDate
                      ? n.timestamp.toDate()
                      : new Date(n.timestamp?.seconds * 1000 || n.timestamp);
                    const diffInSeconds = Math.floor(
                      (new Date() - date) / 1000,
                    );

                    if (diffInSeconds < 60) return "just now";

                    return date.toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  })()}
                </div>
              </div>
            ))
          ) : (
            <div className="notify-item text-center">
              No new notifications{error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
