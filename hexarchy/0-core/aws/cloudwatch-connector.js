export const cloudwatchConnector = {
  connect: async () => console.log('CloudWatch connector initialized'),
  putMetricData: async (params) => ({ success: true })
}

export default cloudwatchConnector