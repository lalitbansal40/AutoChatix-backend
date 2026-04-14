import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sesClient";


type SendEmailParams = {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
};

export const sendEmail = async ({
  to,
  subject,
  body,
  isHtml = false,
}: SendEmailParams) => {
  try {
    const command = new SendEmailCommand({
      Source: "no-reply@autochatix.com",
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: isHtml
          ? {
              Html: {
                Data: body,
              },
            }
          : {
              Text: {
                Data: body,
              },
            },
      },
    });

    const response = await sesClient.send(command);

    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error: any) {
    console.error("Email Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};