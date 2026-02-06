// DynamoDB Query Builder
export class QueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.params = { TableName: tableName };
  }

  key(keyName, keyValue) {
    this.params.Key = { ...this.params.Key, [keyName]: keyValue };
    return this;
  }

  filter(expression, values) {
    this.params.FilterExpression = expression;
    this.params.ExpressionAttributeValues = values;
    return this;
  }

  index(indexName) {
    this.params.IndexName = indexName;
    return this;
  }

  limit(limit) {
    this.params.Limit = limit;
    return this;
  }

  ascending() {
    this.params.ScanIndexForward = true;
    return this;
  }

  descending() {
    this.params.ScanIndexForward = false;
    return this;
  }

  select(attributes) {
    this.params.ProjectionExpression = attributes.join(', ');
    return this;
  }

  build() {
    return this.params;
  }
}

export const query = (tableName) => new QueryBuilder(tableName);
export default QueryBuilder;
