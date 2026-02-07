import { gql } from '@apollo/client'

export const GET_HEALTH = gql`
  query GetHealth {
    health
    version
  }
`

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      subscription
      createdAt
    }
  }
`

export const GET_VIDEOS = gql`
  query GetVideos {
    videos {
      id
      title
      url
      status
      userId
      createdAt
    }
  }
`

export const GET_ANALYTICS = gql`
  query GetAnalytics {
    analytics {
      totalUsers
      totalVideos
      revenue
      activeStreams
    }
  }
`

export const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      email
      name
      createdAt
    }
  }
`

export const UPLOAD_VIDEO = gql`
  mutation UploadVideo($input: VideoInput!) {
    uploadVideo(input: $input) {
      id
      title
      status
      userId
      createdAt
    }
  }
`

export const PROCESS_PAYMENT = gql`
  mutation ProcessPayment($input: PaymentInput!) {
    processPayment(input: $input) {
      success
      transactionId
      message
    }
  }
`
