import { z } from "zod";

const ExactPayload = (length: number) => z.array(z.number()).length(length);
const VariablePayload = z.array(z.number()).max(0xff);

const RecvBroadcastFromUser = z.object({
  userId: z.number(),
  op: z.literal("RecvBroadcastFromUser"),
  payload: ExactPayload(0x6),
});

const RecvDataFromUser = z.object({
  userId: z.number(),
  op: z.literal("RecvDataFromUser"),
  payload: VariablePayload,
});

export const ServerCommand = z.union([RecvBroadcastFromUser, RecvDataFromUser]);

export const ClientCommand = z.union([
  RecvBroadcastFromUser.omit({ userId: true }),
  RecvDataFromUser.omit({ userId: true }),
]);

export type RecvBroadcastFromUser = z.infer<typeof RecvBroadcastFromUser>;
export type RecvDataFromUser = z.infer<typeof RecvDataFromUser>;
export type ServerCommand = z.infer<typeof ServerCommand>;
export type ClientCommand = z.infer<typeof ClientCommand>;
