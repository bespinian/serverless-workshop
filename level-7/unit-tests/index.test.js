import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { handler } from "./index.mjs";

const ddbMock = mockClient(DynamoDBClient);

beforeEach(() => {
  ddbMock.reset();

  ddbMock.on(GetItemCommand, { TableName: "jokes" }).resolves({
    Item: {
      ID: {
        N: "1",
      },
      Text: {
        S: "funny joke from shared table",
      },
    },
  });

  ddbMock.on(GetItemCommand, { TableName: "jokes-test-user" }).resolves({
    Item: {
      ID: {
        N: "1",
      },
      Text: {
        S: "funny joke from user-specific table",
      },
    },
  });
});

test("A joke is returned from the shared table", async () => {
  const result = await handler({ jokeID: "1" });
  expect(result).toBeDefined();
  expect(result.Text.S).toBe("funny joke from shared table");
});

test("Table suffix env variable is honored", async () => {
  process.env.JOKE_TABLE_SUFFIX = "-test-user";
  const result = await handler({ jokeID: "1" });
  expect(result).toBeDefined();
  expect(result.Text.S).toBe("funny joke from user-specific table");
});
