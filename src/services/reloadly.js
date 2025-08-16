import axios from "axios";
import { RELOADLY_AUTH, RELOADLY_TOPUP_API_ENDPOINT } from "../constants.js";

export const getAuthCode = async () => {
  const client_id = process.env.RELOADLY_CLIENT_ID;
  const client_secret = process.env.RELOADLY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return;
  }

  const response = await axios
    .post(RELOADLY_AUTH, {
      client_id,
      client_secret,
      grant_type: "client_credentials",
      audience: RELOADLY_TOPUP_API_ENDPOINT,
    })
    .then((data) => data)
    .catch((error) => error);

  if (response.status === 200) {
    return response.data.access_token;
  } else {
    return null;
  }
};

export const getOperatorDetailsFromReloadly = async (phone) => {
  const authToken = await getAuthCode();

  const response = await axios
    .get(
      `${RELOADLY_TOPUP_API_ENDPOINT}/operators/auto-detect/phone/${phone}/countries/IN`,
      {
        headers: {
          Accept: "application/com.reloadly.topups-v1+json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    )
    .then((response) => response)
    .catch((error) => error);

  console.log(response.data);

  if (response.status === 200) {
    return {
      operatorId: response.data.operatorId,
      fixedAmounts: response.data.fixedAmounts,
    };
  }
};

export const redeemPoints = async (operator_id, amount, phone) => {
  const authToken = await getAuthCode();

  const response = await axios
    .post(
      RELOADLY_TOPUP_API_ENDPOINT + "/topups-async",
      {
        operatorId: operator_id,
        amount: amount,
        recipientPhone: { countryCode: "IN", number: phone },
        senderPhone: {
          countryCode: "IN",
          number: process.env.MUKKAMAR_PHONE,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/com.reloadly.topups-v1+json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    )
    .then((data) => data)
    .catch((error) => error);

  return response.status;
};
