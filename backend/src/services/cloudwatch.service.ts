import {
  CloudWatchLogsClient,
  GetLogEventsCommand,
  DescribeLogStreamsCommand,
  type OutputLogEvent,
} from "@aws-sdk/client-cloudwatch-logs";
import { env } from "../config/env.js";

const client = new CloudWatchLogsClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export interface LogLine {
  message: string;
  timestamp: number;
}

export interface LogEventsResult {
  events: LogLine[];
  nextForwardToken: string | null;
}

export async function getLogEvents(
  logGroupName: string,
  logStreamName: string,
  nextToken?: string | null
): Promise<LogEventsResult> {
  const command = new GetLogEventsCommand({
    logGroupName,
    logStreamName,
    nextToken: nextToken ?? undefined,
    startFromHead: true,
  });

  const response = await client.send(command);

  const events: LogLine[] = (response.events ?? [])
    .filter((e: OutputLogEvent): e is Required<OutputLogEvent> => !!e.message)
    .map((e) => ({
      message: e.message!.trimEnd(),
      timestamp: e.timestamp ?? Date.now(),
    }));

  return {
    events,
    nextForwardToken: response.nextForwardToken ?? null,
  };
}

export async function waitForLogStream(
  logGroupName: string,
  logStreamName: string,
  maxRetries = 15,
  delayMs = 2000
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await client.send(
        new DescribeLogStreamsCommand({
          logGroupName,
          logStreamNamePrefix: logStreamName,
          limit: 1,
        })
      );
      if ((response.logStreams?.length ?? 0) > 0) return true;
    } catch {
      // log group may not exist yet — retry
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}
