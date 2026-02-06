import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'

export class AIServiceConnector {
  constructor() {
    this.lambda = new LambdaClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    })
  }

  async processVideoGeneration(request) {
    try {
      const command = new InvokeCommand({
        FunctionName: `${process.env.AWS_STACK_NAME || 'hootner'}-video-generator`,
        Payload: JSON.stringify(request)
      })
      
      return await this.lambda.send(command)
    } catch (error) {
      console.error('Video generation failed:', error)
      throw error
    }
  }

  async runStableDiffusion(prompt, options = {}) {
    const command = new InvokeCommand({
      FunctionName: `${process.env.AWS_STACK_NAME}-stable-diffusion`,
      Payload: JSON.stringify({ prompt, ...options })
    })
    
    return await this.lambda.send(command)
  }

  async moderateContent(content) {
    const command = new InvokeCommand({
      FunctionName: `${process.env.AWS_STACK_NAME}-content-moderation`,
      Payload: JSON.stringify({ content })
    })
    
    return await this.lambda.send(command)
  }
}

export default new AIServiceConnector()