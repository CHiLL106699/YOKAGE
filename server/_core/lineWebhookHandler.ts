import { Request, Response } from 'express';
import { verifyLineSignature } from './lineWebhook';
import { appRouter } from '../routers';
import { createContext } from './context';

/**
 * Express middleware to handle LINE Webhook
 */
export async function lineWebhookHandler(req: Request, res: Response) {
  const signature = req.headers['x-line-signature'] as string;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!signature || !channelSecret) {
    console.error('Missing signature or channel secret');
    return res.status(401).send('Unauthorized');
  }

  // Get raw body for signature verification
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  
  const isValid = verifyLineSignature(rawBody, signature, channelSecret);
  if (!isValid) {
    console.error('Invalid LINE signature');
    return res.status(401).send('Unauthorized');
  }

  // 1. Respond to LINE immediately (within 1s)
  res.status(200).send('OK');

  // 2. Process events asynchronously using tRPC router logic
  // We use organizationId = 1 as default for this single-tenant setup or as a placeholder
  // In a multi-tenant setup, this should be derived from the URL or destination ID
  const organizationId = 1; 

  try {
    const caller = appRouter.createCaller(await createContext({ req, res }));
    await caller.lineWebhook.processWebhookEvent({
      organizationId,
      signature,
      body: rawBody,
    });
  } catch (error) {
    console.error('Error processing LINE webhook:', error);
  }
}
