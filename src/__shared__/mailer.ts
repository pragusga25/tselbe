import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';
import { config } from './config';

const credentials = {
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
};

const ses = new SESClient({
  credentials,
});

export const sendEmail = async (
  input: Omit<SendEmailCommandInput, 'Source'>
) => {
  if (config.AWS_SES_SENDER_EMAIL) {
    await ses
      .send(
        new SendEmailCommand({
          Source: config.AWS_SES_SENDER_EMAIL,
          ...input,
        })
      )
      .catch(console.error);
  }
};
