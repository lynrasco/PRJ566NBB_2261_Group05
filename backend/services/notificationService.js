const sendPushNotification = async ({
  expoPushToken,
  title,
  body,
  data = {},
}) => {
  if (!expoPushToken) {
    const error = new Error(
      "No push notification token registered for this user"
    );
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch(
    "https://exp.host/--/api/v2/push/send",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const error = new Error("Failed to send push notification");
    error.statusCode = 502;
    error.details = result;
    throw error;
  }

  return result;
};

module.exports = {
  sendPushNotification,
};