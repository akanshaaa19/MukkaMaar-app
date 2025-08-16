import axios from "axios";
import { GLIFIC_ENDPOINT } from "../constants.js";
import https from "https";

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const getAuthToken = async () => {
  const phone = process.env.LOGIN_PHONE;
  const password = process.env.LOGIN_PASSWORD;

  const authData = {
    phone: phone,
    password: password,
  };

  const authResponse = await axiosInstance.post(
    `${GLIFIC_ENDPOINT}/v1/session`,
    {
      user: authData,
    }
  );

  return authResponse.data.data.access_token;
};

export const callResumeFlow = async (contactId, flowId, result) => {
  const authToken = await getAuthToken();

  const payload = {
    query: `
      mutation resumeContactFlow($flowId: ID!, $contactId: ID!, $result: Json!) {
        resumeContactFlow(flowId: $flowId, contactId: $contactId, result: $result) {
          success
          errors {
            key
            message
          }
        }
      }
    `,
    variables: {
      flowId: flowId,
      contactId: contactId,
      result: JSON.stringify(result),
    },
  };

  const resumeFlowResponse = await axiosInstance.post(
    `${GLIFIC_ENDPOINT}`,
    payload,
    {
      headers: {
        authorization: authToken,
        "Content-Type": "application/json",
      },
    }
  );

  if (resumeFlowResponse.status === 200) {
    return resumeFlowResponse.data;
  } else {
    // throw new Error("Failed to resume contact flow");
  }
};
