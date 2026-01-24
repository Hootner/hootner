// Base Repository
import { docClient } from '../../0-core/database/dynamodb/config.js';
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

export class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async create(item) {
    await docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: item
    }));
    return item;
  }

  async findById(id) {
    const result = await docClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { id }
    }));
    return result.Item || null;
  }

  async update(id, updates) {
    const updateExpressions = [];
    const attributeNames = {};
    const attributeValues = {};

    Object.entries(updates).forEach(([key, value], index) => {
      updateExpressions.push(`#attr${index} = :val${index}`);
      attributeNames[`#attr${index}`] = key;
      attributeValues[`:val${index}`] = value;
    });

    const result = await docClient.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    return result.Attributes;
  }

  async delete(id) {
    await docClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { id }
    }));
    return true;
  }

  async findAll(limit = 100) {
    const result = await docClient.send(new ScanCommand({
      TableName: this.tableName,
      Limit: limit
    }));
    return result.Items || [];
  }

  async query(keyCondition, expressionAttributeValues, options = {}) {
    const result = await docClient.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionAttributeValues,
      ...options
    }));
    return result.Items || [];
  }
}

export default BaseRepository;
