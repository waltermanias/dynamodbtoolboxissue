import "dotenv/config";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  Table,
  Entity,
  string,
  schema,
  PutItemCommand,
  UpdateAttributesCommand,
} from "dynamodb-toolbox";

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY ?? "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY ?? "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const MyTable = new Table({
  name: "TestUpdate",
  entityAttributeSavedAs: "entity",
  partitionKey: {
    name: "pk",
    type: "string",
  },
  sortKey: {
    name: "sk",
    type: "string",
  },
  documentClient: docClient,
});

const MyEntity = new Entity({
  name: "MyEntity",
  schema: schema({
    propertyA: string().key(),
    propertyB: string().key(),
    propertyC: string().optional(),
    propertyD: string().optional(),
  }),
  computeKey: ({ propertyA, propertyB }) => ({
    pk: propertyA,
    sk: propertyB,
  }),
  table: MyTable,
  timestamps: {
    modified: {
      name: "updatedAt",
      savedAs: "updatedAt",
    },
    created: {
      name: "createdAt",
      savedAs: "createdAt",
    },
  },
});

const writeItem = async (): Promise<void> => {
  try {
    await MyEntity.build(PutItemCommand)
      .item({
        propertyA: "MyPK",
        propertyB: "MySK",
        propertyC: "InitialPropertyCValue",
        propertyD: "InitialPropertyDValue",
      })
      .options({
        condition: {
          and: [
            { attr: "propertyA", exists: false },
            { attr: "propertyB", exists: false },
          ],
        },
      })
      .send();
    console.log("Item written successfully:");
  } catch (error) {
    console.error("Error writing item:", error);
  }
};

const updateItem = async (): Promise<void> => {
  await MyEntity.build(UpdateAttributesCommand)
    .item({
      propertyA: "MyPK",
      propertyB: "MySK",
      propertyC: "UpdatedPropertyCValue",
      // We do not want to update propertyD
    })
    .options({
      condition: {
        and: [
          { attr: "propertyA", exists: true },
          { attr: "propertyB", exists: true },
        ],
      },
    })
    .send();
};

writeItem().then(async () => {
  await updateItem();
});
