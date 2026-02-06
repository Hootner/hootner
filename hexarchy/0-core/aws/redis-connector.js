export const redisConnector = {
  connect: async () => console.log('Redis connector initialized'),
  get: async (key) => null,
  set: async (key, value) => true
}

export default redisConnector