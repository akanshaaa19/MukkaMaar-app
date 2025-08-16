import {
  getOperatorDetails,
  getEligiblePoints,
  rechargePhone,
} from "./services/services.js";

export const addPoints = async (req, res) => {
  var eventName = req?.body?.event_name;

  if (!eventName) {
    res.json({
      error: "Event name is required",
    });
    return;
  }

  const validEvents = ["get-operator", "redeem-points", "recharge-options"];
  if (!validEvents.includes(eventName)) {
    res.json({
      error: "No handler for event: " + eventName,
    });
    console.log("---- No handler for event:" + eventName + " -------");
    return;
  }

  res.json({
    success: true,
    message: "Event received and is being processed",
    event: eventName,
  });

  switch (eventName) {
    case "get-operator":
      console.log("---- Handling event:" + eventName + " -------");
      await getOperatorDetails(req, res);
      break;

    case "redeem-points":
      console.log("---- Handling event:" + eventName + " -------");
      await rechargePhone(req, res);
      break;
    case "recharge-options":
      console.log("---- Handling event:" + eventName + " -------");
      await getEligiblePoints(req, res);
      break;
    default:
      res.json({
        error: "No handler for event: " + eventName,
      });
      console.log("---- No handler for event:" + eventName + " -------");
      return;
  }
};
