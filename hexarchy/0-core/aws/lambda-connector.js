export const lambdaConnector = {
  connect: async () => console.log('Lambda connector initialized'),
  invoke: async (params) => ({ StatusCode: 200 })
}

export default lambdaConnector