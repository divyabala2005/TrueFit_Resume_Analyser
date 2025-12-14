// src/utils/activity.js

// src/utils/activity.js

// Backend handles timestamp generation now.
// We just need to export the addActivity function.

// Save a new activity item into backend
import api from "../api/client";

export const addActivity = async (event) => {
  try {
    // Backend expects specific fields. Ensure 'event' matches ActivityLog schema.
    // { type, tag, title, detail, route }
    await api.post("/api/activity/", {
      type: event.type,
      tag: event.tag,
      title: event.title,
      detail: event.detail,
      route: event.route,
    });
  } catch (err) {
    console.warn("Could not save activity:", err);
  }
};
