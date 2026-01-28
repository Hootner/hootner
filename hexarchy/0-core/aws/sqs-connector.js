export const sqsConnector = {
  connect: async () => console.log('SQS connector initialized'),
  sendMessage: async (params) => ({ MessageId: 'test' })
}

export default sqsConnector