import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { config } from 'dotenv'

config()

const REGION = process.env.AWS_REGION || 'us-east-1'
const TABLE_NAME =
  process.env.DYNAMODB_TABLE_NAME || process.env.DYNAMO_TABLE || 'HootnerActivities'
const DYNAMO_ENDPOINT =
  process.env.DYNAMODB_ENDPOINT || process.env.DYNAMO_ENDPOINT || undefined

const clientConfig = {
  region: REGION,
  ...(DYNAMO_ENDPOINT && { endpoint: DYNAMO_ENDPOINT }),
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
}

const dynamoClient = new DynamoDBClient(clientConfig)

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true },
})

export { docClient, TABLE_NAME, REGION, DYNAMO_ENDPOINT }
