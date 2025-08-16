import { callResumeFlow } from "./glific.js";
import { getOperatorDetailsFromReloadly, redeemPoints } from "./reloadly.js";

export const getOperatorDetails = async (req) => {
  const { contact, flowId } = req.body;

  const { operatorId, fixedAmounts } = await getOperatorDetailsFromReloadly(
    contact.phone
  );

  if (operatorId && fixedAmounts) {
    callResumeFlow(contact.id, flowId, {
      operatorSuccess: true,
      operatorId: operatorId,
      fixedAmounts: fixedAmounts?.toString(),
    });
  } else {
    callResumeFlow(contact.id, flowId, {
      operatorSuccess: false,
      error: "Error while fetching operator id",
    });
  }
};

export const rechargePhone = async (req) => {
  const { contact, eligibleAmount, operator_id, pointsToDeduct, flowId } =
    req.body;

  const response = await redeemPoints(
    operator_id,
    eligibleAmount,
    contact.phone
  );

  if (response === 200) {
    callResumeFlow(contact.id, flowId, {
      rechargeDone: true,
      message: "Successfully recharged the mobile and deducted points",
      pointsToDeduct,
    });
  } else {
    callResumeFlow(contact.id, flowId, {
      rechargeDone: false,
      message: response.data,
      pointsToDeduct,
    });
  }
};

function getAmountForPoints(points, fixedAmounts) {
  if (!points || points < 100) {
    return { rechargeDenomination: 0, pointsToDeduct: 0 };
  }

  if (
    !fixedAmounts ||
    !Array.isArray(fixedAmounts) ||
    fixedAmounts.length === 0
  ) {
    return { rechargeDenomination: 0, pointsToDeduct: 0 };
  }

  const eligibleAmount = Math.floor(points / 100);

  const sortedAmounts = fixedAmounts
    .map((amount) => parseInt(amount))
    .filter((amount) => !isNaN(amount))
    .sort((a, b) => a - b);

  if (sortedAmounts.length === 0) {
    return { rechargeDenomination: 0, pointsToDeduct: 0 };
  }

  let rechargeDenomination = 0;

  for (const amount of sortedAmounts) {
    if (amount <= eligibleAmount) {
      rechargeDenomination = amount;
    } else {
      break;
    }
  }

  const pointsToDeduct = rechargeDenomination * 100;

  return {
    rechargeDenomination,
    pointsToDeduct,
  };
}

export const getEligiblePoints = async (req) => {
  try {
    let finalResult = {
      recharge: false,
      totalPoints: 0,
      eligibleAmount: 0,
      pointsToDeduct: 0,
    };
    const { total_points, fixedAmounts, contact, flowId } = req.body;
    let fixedAmountsToUse = fixedAmounts;

    if (!fixedAmounts) {
      const operatorDetails = await getOperatorDetailsFromReloadly(
        contact.phone
      );
      fixedAmountsToUse = operatorDetails.fixedAmounts;
    }

    const finalFixedAmount = fixedAmountsToUse.split(",");
    const totalPoints = parseInt(total_points);

    if (totalPoints >= 1000) {
      const rechargeOptionsData = getAmountForPoints(
        totalPoints,
        finalFixedAmount
      );

      const { rechargeDenomination, pointsToDeduct } = rechargeOptionsData;

      finalResult = {
        recharge: true,
        totalPoints: totalPoints,
        eligibleAmount: rechargeDenomination,
        pointsToDeduct: pointsToDeduct,
        message: "Succesfully fetched recharge options for points",
      };
    } else {
      finalResult = {
        recharge: false,
        totalPoints: totalPoints,
        eligibleAmount: 0,
        pointsToDeduct: 0,
        message:
          "Insufficient points. Earn 1000 points to get mobile recharge coupon. You are at " +
          totalPoints +
          " right now. All the best",
      };
    }

    callResumeFlow(contact.id, flowId, finalResult);
  } catch (error) {
    callResumeFlow(contact.id, flowId, {
      recharge: false,
      message: "Error while fetching eligible points",
      error: "Internal server error",
    });
  }
};
