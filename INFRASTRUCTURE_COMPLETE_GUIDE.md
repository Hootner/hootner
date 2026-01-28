# 🏗️ HOOTNER Infrastructure - Complete Missing Components Guide

**Date:** January 24, 2026  
**Purpose:** Comprehensive checklist of missing infrastructure components for AWS deployment  
**Focus:** AWS SAM Templates + Application Composer

---

## 📊 Executive Summary

Your HOOTNER platform has:
- ✅ 20 Lambda Functions defined
- ✅ 1 DynamoDB Table
- ✅ API Gateway with API Key
- ✅ Secrets Manager
- ✅ CloudFront domain (hardcoded: daxqx65ar35pp.cloudfront.net)

**Critical Gaps:** 18 major infrastructure categories missing

---

## 🚨 CRITICAL MISSING COMPONENTS (Add First)

### 1. **S3 Buckets** (3 Required)

**Current State:** ❌ Not defined  
**Impact:** Cannot store videos, uploads, or serve static assets  
**Priority:** CRITICAL

```yaml
# Add to template.yaml

Resources:
  VideoStorageBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub hootner-videos-${AWS::AccountId}
      VersioningConfiguration:
        Status: Enabled
      LifecycleConfiguration:
        Rules:
          - Id: DeleteOldVersions
            Status: Enabled
            NoncurrentVersionExpirationInDays: 90
      CorsConfiguration:
        CorsRules:
          - AllowedOrigins: 
              - https://daxqx65ar35pp.cloudfront.net
            AllowedMethods: [GET, PUT, POST, DELETE]
            AllowedHeaders: ['*']
            MaxAge: 3000
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      Tags:
        - Key: Purpose
          Value: VideoStorage
        - Key: Project
          Value: Hootner

  UploadBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub hootner-uploads-${AWS::AccountId}
      CorsConfiguration:
        CorsRules:
          - AllowedOrigins: 
              - https://daxqx65ar35pp.cloudfront.net
            AllowedMethods: [GET, PUT, POST]
            AllowedHeaders: ['*']
      NotificationConfiguration:
        QueueConfigurations:
          - Event: s3:ObjectCreated:*
            Queue: !GetAtt VideoProcessingQueue.Arn
      Tags:
        - Key: Purpose
          Value: UserUploads
        - Key: Project
          Value: Hootner

  StaticAssetsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub hootner-frontend-${AWS::AccountId}
      WebsiteConfiguration:
        IndexDocument: dashboard.html
        ErrorDocument: error.html
      CorsConfiguration:
        CorsRules:
          - AllowedOrigins: ['*']
            AllowedMethods: [GET]
      Tags:
        - Key: Purpose
          Value: StaticAssets
        - Key: Project
          Value: Hootner

  # S3 Bucket Policies
  StaticAssetsBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref StaticAssetsBucket
      PolicyDocument:
        Statement:
          - Sid: CloudFrontReadAccess
            Effect: Allow
            Principal:
              AWS: !Sub arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${CloudFrontOAI}
            Action: s3:GetObject
            Resource: !Sub ${StaticAssetsBucket.Arn}/*
```

**AWS Composer:** Drag "S3 Bucket" from left panel (3 times)

---

### 2. **CloudFront Distribution** (CDN)

**Current State:** ❌ Domain hardcoded, no resource defined  
**Impact:** Cannot serve static assets or cache API responses  
**Priority:** CRITICAL

```yaml
Resources:
  CloudFrontOAI:
    Type: AWS::CloudFront::CloudFrontOriginAccessIdentity
    Properties:
      CloudFrontOriginAccessIdentityConfig:
        Comment: !Sub Access identity for ${AWS::StackName}

  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          # S3 Static Assets Origin
          - Id: S3Origin
            DomainName: !GetAtt StaticAssetsBucket.RegionalDomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub origin-access-identity/cloudfront/${CloudFrontOAI}
          
          # API Gateway Origin
          - Id: ApiOrigin
            DomainName: !Sub ${HootnerApi}.execute-api.${AWS::Region}.amazonaws.com
            OriginPath: /prod
            CustomOriginConfig:
              HTTPSPort: 443
              OriginProtocolPolicy: https-only
        
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods: [GET, HEAD, OPTIONS]
          CachedMethods: [GET, HEAD, OPTIONS]
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
          Compress: true
          MinTTL: 0
          DefaultTTL: 86400
          MaxTTL: 31536000
        
        # Cache behavior for API calls
        CacheBehaviors:
          - PathPattern: /api/*
            TargetOriginId: ApiOrigin
            ViewerProtocolPolicy: https-only
            AllowedMethods: [GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE]
            ForwardedValues:
              QueryString: true
              Headers:
                - Authorization
                - x-api-key
              Cookies:
                Forward: all
            MinTTL: 0
            DefaultTTL: 0
            MaxTTL: 0
          
          - PathPattern: /graphql
            TargetOriginId: ApiOrigin
            ViewerProtocolPolicy: https-only
            AllowedMethods: [GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE]
            ForwardedValues:
              QueryString: true
              Headers: ['*']
            MinTTL: 0
            DefaultTTL: 0
            MaxTTL: 0
        
        Enabled: true
        HttpVersion: http2
        PriceClass: PriceClass_100
        ViewerCertificate:
          CloudFrontDefaultCertificate: true
        
        CustomErrorResponses:
          - ErrorCode: 404
            ResponseCode: 200
            ResponsePagePath: /dashboard.html
            ErrorCachingMinTTL: 300
        
        Comment: !Sub ${AWS::StackName} CDN
        Tags:
          - Key: Project
            Value: Hootner

Outputs:
  CloudFrontDomain:
    Description: CloudFront Distribution Domain
    Value: !GetAtt CloudFrontDistribution.DomainName
    Export:
      Name: !Sub ${AWS::StackName}-CloudFrontDomain
```

**AWS Composer:** Drag "CloudFront Distribution" from left panel

---

### 3. **Cognito User Pool** (Authentication)

**Current State:** ❌ JWT mentioned, no Cognito resource  
**Impact:** No user authentication/authorization  
**Priority:** CRITICAL

```yaml
Resources:
  UserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      UserPoolName: !Sub ${AWS::StackName}-users
      AutoVerifiedAttributes:
        - email
      UsernameAttributes:
        - email
      Schema:
        - Name: email
          Required: true
          Mutable: false
        - Name: name
          Required: true
          Mutable: true
      Policies:
        PasswordPolicy:
          MinimumLength: 8
          RequireUppercase: true
          RequireLowercase: true
          RequireNumbers: true
          RequireSymbols: true
      MfaConfiguration: OPTIONAL
      EnabledMfas:
        - SOFTWARE_TOKEN_MFA
      AccountRecoverySetting:
        RecoveryMechanisms:
          - Name: verified_email
            Priority: 1
      UserAttributeUpdateSettings:
        AttributesRequireVerificationBeforeUpdate:
          - email
      UserPoolTags:
        Project: Hootner

  UserPoolClient:
    Type: AWS::Cognito::UserPoolClient
    Properties:
      UserPoolId: !Ref UserPool
      ClientName: !Sub ${AWS::StackName}-web-client
      GenerateSecret: false
      ExplicitAuthFlows:
        - ALLOW_USER_PASSWORD_AUTH
        - ALLOW_REFRESH_TOKEN_AUTH
        - ALLOW_USER_SRP_AUTH
      PreventUserExistenceErrors: ENABLED
      AccessTokenValidity: 1
      IdTokenValidity: 1
      RefreshTokenValidity: 30
      TokenValidityUnits:
        AccessToken: hours
        IdToken: hours
        RefreshToken: days

  UserPoolDomain:
    Type: AWS::Cognito::UserPoolDomain
    Properties:
      Domain: !Sub hootner-${AWS::AccountId}
      UserPoolId: !Ref UserPool

Outputs:
  UserPoolId:
    Value: !Ref UserPool
    Export:
      Name: !Sub ${AWS::StackName}-UserPoolId
  
  UserPoolClientId:
    Value: !Ref UserPoolClient
    Export:
      Name: !Sub ${AWS::StackName}-UserPoolClientId
```

**AWS Composer:** Drag "Cognito User Pool" from left panel

---

### 4. **SQS Queues** (Async Processing)

**Current State:** ❌ Not defined  
**Impact:** No async video processing, no retry mechanism  
**Priority:** CRITICAL

```yaml
Resources:
  VideoProcessingQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub ${AWS::StackName}-video-processing
      VisibilityTimeout: 900
      MessageRetentionPeriod: 1209600  # 14 days
      ReceiveMessageWaitTimeSeconds: 20
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt DeadLetterQueue.Arn
        maxReceiveCount: 3
      Tags:
        - Key: Purpose
          Value: VideoProcessing
        - Key: Project
          Value: Hootner

  DeadLetterQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub ${AWS::StackName}-dlq
      MessageRetentionPeriod: 1209600  # 14 days
      Tags:
        - Key: Purpose
          Value: DeadLetterQueue
        - Key: Project
          Value: Hootner

  NotificationQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub ${AWS::StackName}-notifications
      VisibilityTimeout: 300
      Tags:
        - Key: Purpose
          Value: Notifications
        - Key: Project
          Value: Hootner

  # Queue Policies
  VideoProcessingQueuePolicy:
    Type: AWS::SQS::QueuePolicy
    Properties:
      Queues:
        - !Ref VideoProcessingQueue
      PolicyDocument:
        Statement:
          - Effect: Allow
            Principal:
              Service: s3.amazonaws.com
            Action: SQS:SendMessage
            Resource: !GetAtt VideoProcessingQueue.Arn
            Condition:
              ArnLike:
                aws:SourceArn: !Sub arn:aws:s3:::hootner-uploads-${AWS::AccountId}

Outputs:
  VideoProcessingQueueUrl:
    Value: !Ref VideoProcessingQueue
    Export:
      Name: !Sub ${AWS::StackName}-VideoQueueUrl
```

**AWS Composer:** Drag "SQS Queue" from left panel (3 times)

---

## 🔴 HIGH PRIORITY COMPONENTS

### 5. **ElastiCache Redis** (Caching)

**Current State:** ❌ Mentioned in docs, not in template  
**Impact:** No caching = slower API responses  
**Priority:** HIGH

```yaml
Resources:
  RedisSubnetGroup:
    Type: AWS::ElastiCache::SubnetGroup
    Properties:
      Description: Subnet group for Redis
      SubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2

  RedisSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Redis access from Lambda
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 6379
          ToPort: 6379
          SourceSecurityGroupId: !Ref LambdaSecurityGroup
      Tags:
        - Key: Name
          Value: !Sub ${AWS::StackName}-redis-sg

  RedisCluster:
    Type: AWS::ElastiCache::CacheCluster
    Properties:
      CacheNodeType: cache.t3.micro
      Engine: redis
      EngineVersion: 7.0
      NumCacheNodes: 1
      Port: 6379
      CacheSubnetGroupName: !Ref RedisSubnetGroup
      VpcSecurityGroupIds:
        - !Ref RedisSecurityGroup
      PreferredMaintenanceWindow: sun:05:00-sun:06:00
      SnapshotRetentionLimit: 5
      SnapshotWindow: 03:00-04:00
      Tags:
        - Key: Project
          Value: Hootner

Outputs:
  RedisEndpoint:
    Value: !GetAtt RedisCluster.RedisEndpoint.Address
    Export:
      Name: !Sub ${AWS::StackName}-RedisEndpoint
```

**AWS Composer:** Drag "ElastiCache" from left panel

---

### 6. **CloudWatch Alarms** (Monitoring)

**Current State:** ❌ No alarms defined  
**Impact:** No alerts for errors, throttling, or performance issues  
**Priority:** HIGH

```yaml
Resources:
  # SNS Topic for Alarms
  AlarmNotificationTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: !Sub ${AWS::StackName}-alarms
      Subscription:
        - Protocol: email
          Endpoint: admin@hootner.com
      Tags:
        - Key: Project
          Value: Hootner

  # API Gateway Alarms
  ApiErrorAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub ${AWS::StackName}-api-5xx-errors
      AlarmDescription: API Gateway 5XX errors exceed threshold
      MetricName: 5XXError
      Namespace: AWS/ApiGateway
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 2
      Threshold: 10
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: ApiName
          Value: !Ref HootnerApi
      AlarmActions:
        - !Ref AlarmNotificationTopic
      TreatMissingData: notBreaching

  Api4xxAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub ${AWS::StackName}-api-4xx-errors
      MetricName: 4XXError
      Namespace: AWS/ApiGateway
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 2
      Threshold: 50
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: ApiName
          Value: !Ref HootnerApi
      AlarmActions:
        - !Ref AlarmNotificationTopic

  ApiLatencyAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub ${AWS::StackName}-api-high-latency
      MetricName: Latency
      Namespace: AWS/ApiGateway
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 5000  # 5 seconds
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: ApiName
          Value: !Ref HootnerApi
      AlarmActions:
        - !Ref AlarmNotificationTopic

  # Lambda Alarms
  LambdaErrorAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub ${AWS::StackName}-lambda-errors
      MetricName: Errors
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 5
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref AlarmNotificationTopic

  LambdaThrottleAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub ${AWS::StackName}-lambda-throttles
      MetricName: Throttles
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 5
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref AlarmNotificationTopic

  # DynamoDB Alarms
  DynamoDBThrottleAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub ${AWS::StackName}-dynamodb-throttles
      MetricName: UserErrors
      Namespace: AWS/DynamoDB
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 10
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: TableName
          Value: !Ref HootnerTable
      AlarmActions:
        - !Ref AlarmNotificationTopic

  DynamoDBReadCapacityAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub ${AWS::StackName}-dynamodb-high-reads
      MetricName: ConsumedReadCapacityUnits
      Namespace: AWS/DynamoDB
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 2
      Threshold: 80
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: TableName
          Value: !Ref HootnerTable
      AlarmActions:
        - !Ref AlarmNotificationTopic

  # SQS Alarms
  SQSDLQAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub ${AWS::StackName}-dlq-messages
      MetricName: ApproximateNumberOfMessagesVisible
      Namespace: AWS/SQS
      Statistic: Average
      Period: 300
      EvaluationPeriods: 1
      Threshold: 1
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: QueueName
          Value: !GetAtt DeadLetterQueue.QueueName
      AlarmActions:
        - !Ref AlarmNotificationTopic
```

**AWS Composer:** Drag "CloudWatch Alarm" from left panel (multiple times)

---

### 7. **WAF WebACL** (Security)

**Current State:** ❌ No WAF protection  
**Impact:** Vulnerable to DDoS, SQL injection, XSS attacks  
**Priority:** HIGH

```yaml
Resources:
  WAFWebACL:
    Type: AWS::WAFv2::WebACL
    Properties:
      Name: !Sub ${AWS::StackName}-waf
      Scope: REGIONAL
      DefaultAction:
        Allow: {}
      Rules:
        # Rate Limiting
        - Name: RateLimitRule
          Priority: 1
          Statement:
            RateBasedStatement:
              Limit: 2000
              AggregateKeyType: IP
          Action:
            Block:
              CustomResponse:
                ResponseCode: 429
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: RateLimitRule
        
        # AWS Managed Rules - Core Rule Set
        - Name: AWSManagedRulesCommonRuleSet
          Priority: 2
          OverrideAction:
            None: {}
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesCommonRuleSet
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: AWSManagedRulesCommonRuleSetMetric
        
        # SQL Injection Protection
        - Name: AWSManagedRulesSQLiRuleSet
          Priority: 3
          OverrideAction:
            None: {}
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesSQLiRuleSet
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: SQLiProtection
        
        # Known Bad Inputs
        - Name: AWSManagedRulesKnownBadInputsRuleSet
          Priority: 4
          OverrideAction:
            None: {}
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesKnownBadInputsRuleSet
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: KnownBadInputs
      
      VisibilityConfig:
        SampledRequestsEnabled: true
        CloudWatchMetricsEnabled: true
        MetricName: !Sub ${AWS::StackName}-waf
      Tags:
        - Key: Project
          Value: Hootner

  # Associate WAF with API Gateway
  WAFAssociation:
    Type: AWS::WAFv2::WebACLAssociation
    Properties:
      ResourceArn: !Sub arn:aws:apigateway:${AWS::Region}::/restapis/${HootnerApi}/stages/prod
      WebACLArn: !GetAtt WAFWebACL.Arn
```

**AWS Composer:** Drag "WAF WebACL" from left panel

---

## 🟡 MEDIUM PRIORITY COMPONENTS

### 8. **VPC & Networking**

```yaml
Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub ${AWS::StackName}-vpc

  PublicSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true

  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [0, !GetAZs '']

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.3.0/24
      AvailabilityZone: !Select [1, !GetAZs '']

  InternetGateway:
    Type: AWS::EC2::InternetGateway

  AttachGateway:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref InternetGateway

  EIP:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc

  NATGateway:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt EIP.AllocationId
      SubnetId: !Ref PublicSubnet

  # Lambda Security Group
  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for Lambda functions
      VpcId: !Ref VPC
      SecurityGroupEgress:
        - IpProtocol: -1
          CidrIp: 0.0.0.0/0
```

### 9. **EventBridge**

```yaml
Resources:
  EventBus:
    Type: AWS::Events::EventBus
    Properties:
      Name: !Sub ${AWS::StackName}-events

  VideoUploadRule:
    Type: AWS::Events::Rule
    Properties:
      Name: video-upload-processing
      EventBusName: !Ref EventBus
      EventPattern:
        source:
          - hootner.videos
        detail-type:
          - VideoUploaded
      State: ENABLED
      Targets:
        - Arn: !GetAtt VideoProcessingQueue.Arn
          Id: VideoQueue
```

### 10. **Step Functions** (Video Processing Workflow)

```yaml
Resources:
  VideoProcessingStateMachine:
    Type: AWS::StepFunctions::StateMachine
    Properties:
      StateMachineName: !Sub ${AWS::StackName}-video-workflow
      RoleArn: !GetAtt StepFunctionsRole.Arn
      DefinitionString: !Sub |
        {
          "Comment": "Video processing workflow",
          "StartAt": "ValidateVideo",
          "States": {
            "ValidateVideo": {
              "Type": "Task",
              "Resource": "${VideoValidationFunction.Arn}",
              "Next": "TranscodeVideo",
              "Catch": [{
                "ErrorEquals": ["States.ALL"],
                "Next": "NotifyFailure"
              }]
            },
            "TranscodeVideo": {
              "Type": "Task",
              "Resource": "${VideoTranscodeFunction.Arn}",
              "Next": "GenerateThumbnail"
            },
            "GenerateThumbnail": {
              "Type": "Task",
              "Resource": "${ThumbnailFunction.Arn}",
              "Next": "UpdateDatabase"
            },
            "UpdateDatabase": {
              "Type": "Task",
              "Resource": "${DatabaseUpdateFunction.Arn}",
              "Next": "NotifySuccess"
            },
            "NotifySuccess": {
              "Type": "Task",
              "Resource": "${NotificationFunction.Arn}",
              "End": true
            },
            "NotifyFailure": {
              "Type": "Task",
              "Resource": "${NotificationFunction.Arn}",
              "End": true
            }
          }
        }

  StepFunctionsRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: states.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaRole
```

### 11. **KMS Encryption Key**

```yaml
Resources:
  EncryptionKey:
    Type: AWS::KMS::Key
    Properties:
      Description: Hootner data encryption key
      KeyPolicy:
        Version: '2012-10-17'
        Statement:
          - Sid: Enable IAM permissions
            Effect: Allow
            Principal:
              AWS: !Sub arn:aws:iam::${AWS::AccountId}:root
            Action: kms:*
            Resource: '*'
          - Sid: Allow Lambda to use key
            Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action:
              - kms:Decrypt
              - kms:DescribeKey
            Resource: '*'

  EncryptionKeyAlias:
    Type: AWS::KMS::Alias
    Properties:
      AliasName: !Sub alias/${AWS::StackName}-key
      TargetKeyId: !Ref EncryptionKey
```

---

## 📊 DynamoDB ENHANCEMENTS

### Missing GSI Attributes

```yaml
HootnerTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: HootnerActivities
    BillingMode: PAY_PER_REQUEST
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true  # ADD THIS
    StreamSpecification:  # ADD THIS for real-time triggers
      StreamViewType: NEW_AND_OLD_IMAGES
    SSESpecification:  # ADD THIS for encryption
      SSEEnabled: true
      SSEType: KMS
      KMSMasterKeyId: !Ref EncryptionKey
    TimeToLiveSpecification:  # ADD THIS for auto-cleanup
      AttributeName: ttl
      Enabled: true
    AttributeDefinitions:
      - AttributeName: PK
        AttributeType: S
      - AttributeName: SK
        AttributeType: S
      - AttributeName: GSI1PK
        AttributeType: S
      - AttributeName: GSI1SK
        AttributeType: S
      - AttributeName: email  # ADD THIS
        AttributeType: S
      - AttributeName: createdAt  # ADD THIS
        AttributeType: N
    KeySchema:
      - AttributeName: PK
        KeyType: HASH
      - AttributeName: SK
        KeyType: RANGE
    GlobalSecondaryIndexes:
      - IndexName: GSI1
        KeySchema:
          - AttributeName: GSI1PK
            KeyType: HASH
          - AttributeName: GSI1SK
            KeyType: RANGE
        Projection:
          ProjectionType: ALL
      - IndexName: UserByEmail  # ADD THIS
        KeySchema:
          - AttributeName: email
            KeyType: HASH
        Projection:
          ProjectionType: ALL
      - IndexName: VideosByDate  # ADD THIS
        KeySchema:
          - AttributeName: GSI1PK
            KeyType: HASH
          - AttributeName: createdAt
            KeyType: RANGE
        Projection:
          ProjectionType: ALL
    Tags:
      - Key: Project
        Value: Hootner
      - Key: Environment
        Value: !Ref Environment
```

---

## 🔧 LAMBDA FUNCTION ENHANCEMENTS

### Missing Configuration

Add to **ALL 20 Lambda Functions**:

```yaml
Properties:
  # ADD THESE:
  Tracing: Active  # X-Ray tracing
  ReservedConcurrentExecutions: 10  # Prevent throttling
  DeadLetterConfig:
    TargetArn: !GetAtt DeadLetterQueue.Arn
  VpcConfig:  # For Redis access
    SecurityGroupIds:
      - !Ref LambdaSecurityGroup
    SubnetIds:
      - !Ref PrivateSubnet1
      - !Ref PrivateSubnet2
  Environment:
    Variables:
      # ADD THESE:
      NODE_ENV: production
      LOG_LEVEL: info
      REDIS_ENDPOINT: !GetAtt RedisCluster.RedisEndpoint.Address
      VIDEO_BUCKET: !Ref VideoStorageBucket
      UPLOAD_BUCKET: !Ref UploadBucket
      KMS_KEY_ID: !Ref EncryptionKey
      USER_POOL_ID: !Ref UserPool
      CLOUDFRONT_DOMAIN: !GetAtt CloudFrontDistribution.DomainName
```

---

## 📋 ENVIRONMENT PARAMETERS

### Add Parameters Section

```yaml
Parameters:
  Environment:
    Type: String
    Default: prod
    AllowedValues:
      - dev
      - staging
      - prod
    Description: Environment name

  AdminEmail:
    Type: String
    Default: admin@hootner.com
    Description: Email for alarm notifications

  CloudFrontPriceClass:
    Type: String
    Default: PriceClass_100
    AllowedValues:
      - PriceClass_100
      - PriceClass_200
      - PriceClass_All
    Description: CloudFront price class

  LambdaMemorySize:
    Type: Number
    Default: 1024
    Description: Lambda memory size in MB

  LambdaTimeout:
    Type: Number
    Default: 30
    Description: Lambda timeout in seconds
```

---

## 🎨 AWS COMPOSER METADATA

### Add Visual Grouping

```yaml
Metadata:
  AWS::Composer::Groups:
    FrontendLayer:
      Label: Frontend & CDN
      Members:
        - StaticAssetsBucket
        - CloudFrontDistribution
        - CloudFrontOAI
    
    ApiLayer:
      Label: API & Functions (20)
      Members:
        - HootnerApi
        - GraphQLFunction
        - VideoPlayerFunction
        - AIVideoGenFunction
        - LiveStreamFunction
        - CodeEditorFunction
        - CollaborationFunction
        - MessagesFunction
        - AnalyticsFunction
        - MarketplaceFunction
        - AIAgentsFunction
        - DevOpsFunction
        - ProfileFunction
        - SettingsFunction
        - UploadFunction
        - SearchFunction
        - NotificationsFunction
        - PaymentsFunction
        - SubscriptionsFunction
        - DashboardFunction
        - FeedFunction
        - APIKeysLayer
    
    DataLayer:
      Label: Data Storage & Cache
      Members:
        - HootnerTable
        - VideoStorageBucket
        - UploadBucket
        - RedisCluster
    
    AuthLayer:
      Label: Authentication & Secrets
      Members:
        - UserPool
        - UserPoolClient
        - UserPoolDomain
        - APISecrets
        - JWTSecret
        - StripeKey
        - EncryptionKey
    
    ProcessingLayer:
      Label: Async Processing
      Members:
        - VideoProcessingQueue
        - DeadLetterQueue
        - NotificationQueue
        - VideoProcessingStateMachine
        - EventBus
    
    MonitoringLayer:
      Label: Monitoring & Alerts
      Members:
        - AlarmNotificationTopic
        - ApiErrorAlarm
        - LambdaErrorAlarm
        - DynamoDBThrottleAlarm
        - SQSDLQAlarm
    
    SecurityLayer:
      Label: Security & Networking
      Members:
        - WAFWebACL
        - VPC
        - LambdaSecurityGroup
        - RedisSecurityGroup
        - NATGateway
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Critical Infrastructure (Week 1)
- [ ] Add 3 S3 Buckets (Video, Upload, Static)
- [ ] Add CloudFront Distribution with OAI
- [ ] Add Cognito User Pool + Client
- [ ] Add 3 SQS Queues (Processing, DLQ, Notifications)
- [ ] Update all Lambda functions with new env vars
- [ ] Test deployment with `sam build && sam deploy --guided`

### Phase 2: High Priority (Week 2)
- [ ] Add ElastiCache Redis cluster
- [ ] Add VPC with 2 private subnets
- [ ] Add 8 CloudWatch Alarms + SNS Topic
- [ ] Add WAF WebACL with rate limiting
- [ ] Add KMS encryption key
- [ ] Update DynamoDB with TTL, PITR, Streams

### Phase 3: Medium Priority (Week 3)
- [ ] Add EventBridge event bus + rules
- [ ] Add Step Functions state machine
- [ ] Add Lambda VPC config for Redis access
- [ ] Add API Gateway request validators
- [ ] Add cost allocation tags
- [ ] Add backup policies

### Phase 4: Optimization (Week 4)
- [ ] Add Lambda reserved concurrency
- [ ] Add DynamoDB auto-scaling
- [ ] Add CloudFront cache behaviors
- [ ] Add S3 lifecycle policies
- [ ] Add CloudWatch Dashboards
- [ ] Performance testing & tuning

---

## 📊 COMPLETE OUTPUTS SECTION

### Add to template.yaml

```yaml
Outputs:
  # API Endpoints
  ApiEndpoint:
    Description: API Gateway Endpoint
    Value: !Sub https://${HootnerApi}.execute-api.${AWS::Region}.amazonaws.com/prod
    Export:
      Name: !Sub ${AWS::StackName}-ApiEndpoint

  GraphQLEndpoint:
    Description: GraphQL Endpoint
    Value: !Sub https://${HootnerApi}.execute-api.${AWS::Region}.amazonaws.com/prod/graphql
    Export:
      Name: !Sub ${AWS::StackName}-GraphQLEndpoint

  # CloudFront
  CloudFrontDomain:
    Description: CloudFront Distribution Domain
    Value: !GetAtt CloudFrontDistribution.DomainName
    Export:
      Name: !Sub ${AWS::StackName}-CloudFrontDomain

  CloudFrontURL:
    Description: CloudFront HTTPS URL
    Value: !Sub https://${CloudFrontDistribution.DomainName}

  # Authentication
  UserPoolId:
    Description: Cognito User Pool ID
    Value: !Ref UserPool
    Export:
      Name: !Sub ${AWS::StackName}-UserPoolId

  UserPoolClientId:
    Description: Cognito User Pool Client ID
    Value: !Ref UserPoolClient
    Export:
      Name: !Sub ${AWS::StackName}-UserPoolClientId

  # Storage
  VideoStorageBucket:
    Description: Video Storage S3 Bucket
    Value: !Ref VideoStorageBucket

  UploadBucket:
    Description: Upload S3 Bucket
    Value: !Ref UploadBucket

  StaticAssetsBucket:
    Description: Static Assets S3 Bucket
    Value: !Ref StaticAssetsBucket

  # Cache
  RedisEndpoint:
    Description: Redis Endpoint
    Value: !GetAtt RedisCluster.RedisEndpoint.Address
    Export:
      Name: !Sub ${AWS::StackName}-RedisEndpoint

  # Queues
  VideoProcessingQueueUrl:
    Description: Video Processing Queue URL
    Value: !Ref VideoProcessingQueue
    Export:
      Name: !Sub ${AWS::StackName}-VideoQueueUrl

  # Monitoring
  AlarmTopicArn:
    Description: SNS Topic for Alarms
    Value: !Ref AlarmNotificationTopic

  # Database
  DynamoDBTableName:
    Description: DynamoDB Table Name
    Value: !Ref HootnerTable
    Export:
      Name: !Sub ${AWS::StackName}-TableName

  # Secrets
  APISecretsArn:
    Description: Secrets Manager ARN
    Value: !Ref APISecrets
    Export:
      Name: !Sub ${AWS::StackName}-SecretsArn

  # API Key
  ApiKey:
    Description: API Gateway Key
    Value: !Ref HootnerApiKey
```

---

## 🎯 QUICK START COMMANDS

```bash
# 1. Validate template
sam validate

# 2. Build
sam build

# 3. Deploy with all new resources
sam deploy \
  --guided \
  --stack-name hootner-platform \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=prod \
    AdminEmail=your-email@example.com

# 4. Get outputs
aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs' \
  --output table

# 5. Upload frontend to S3
aws s3 sync hexarchy/4-interface/ui/pages/ \
  s3://hootner-frontend-$(aws sts get-caller-identity --query Account --output text)/ \
  --delete

# 6. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## 📦 AWS COMPOSER IMPORT STEPS

1. **Open AWS Application Composer**
   - Navigate to: https://console.aws.amazon.com/composer
   - Sign in with account: 504165876439

2. **Import Enhanced Template**
   - Click "Create new project" or "Import template"
   - Select: `template-complete.yaml` (create this with all components above)
   - Composer will visualize all resources

3. **Visual Verification**
   - Verify 7 groups appear (Frontend, API, Data, Auth, Processing, Monitoring, Security)
   - Check all connections between resources
   - Drag resources to organize layout

4. **Deploy from Composer**
   - Click "Deploy" button
   - Stack name: `hootner-platform`
   - Parameters: Fill in admin email, environment
   - Click "Create stack"

5. **Monitor Deployment**
   - Watch CloudFormation Events tab
   - Deployment takes ~15-20 minutes
   - Check for any errors

6. **Post-Deployment**
   - Copy CloudFront domain from Outputs
   - Update frontend API calls to use new endpoints
   - Test all 20 CloudFront apps

---

## 💰 ESTIMATED COSTS (Monthly)

### Always Free Tier
- Lambda: First 1M requests free
- API Gateway: First 1M calls free
- DynamoDB: 25GB storage free
- CloudFront: 1TB transfer free (first 12 months)

### Paid Resources (Production)
- **S3:** ~$5-10 (1TB video storage)
- **CloudFront:** ~$10-20 (beyond free tier)
- **DynamoDB:** ~$5-15 (PAY_PER_REQUEST)
- **ElastiCache Redis (t3.micro):** ~$12
- **NAT Gateway:** ~$32
- **Lambda (beyond free tier):** ~$5-10
- **Secrets Manager:** ~$1.20
- **CloudWatch Alarms:** ~$1 per alarm
- **WAF:** ~$5 + $1 per million requests

**Total Estimated:** $75-125/month for production workload

### Cost Optimization Tips
- Use Lambda@Edge instead of NAT Gateway
- Use CloudFront caching to reduce API calls
- Enable DynamoDB auto-scaling
- Use S3 Intelligent-Tiering
- Set lifecycle policies for old videos

---

## 🔧 TROUBLESHOOTING

### Common Deployment Issues

1. **Stack fails: "Resource already exists"**
   ```bash
   # Delete existing resources first
   aws cloudformation delete-stack --stack-name hootner-platform
   ```

2. **Lambda VPC timeout**
   - Ensure NAT Gateway is created
   - Check security group rules
   - Verify subnet route tables

3. **CloudFront OAI access denied**
   - Verify S3 bucket policy allows CloudFront OAI
   - Check bucket CORS configuration

4. **Redis connection timeout**
   - Ensure Lambda is in VPC
   - Check security group allows port 6379
   - Verify Redis endpoint is correct

5. **API Gateway 403 Forbidden**
   - Check API Key is passed in headers
   - Verify WAF rules aren't blocking
   - Check CORS configuration

---

## 📚 NEXT STEPS AFTER DEPLOYMENT

1. **Frontend Configuration**
   - Update all HTML pages with new API endpoints
   - Replace hardcoded CloudFront domain with output value
   - Update API key in all fetch requests

2. **Database Seeding**
   - Create sample users in Cognito
   - Populate DynamoDB with test data
   - Upload test videos to S3

3. **Monitoring Setup**
   - Subscribe email to SNS alarm topic
   - Create CloudWatch Dashboards
   - Set up log retention policies

4. **Security Audit**
   - Review IAM policies (least privilege)
   - Enable CloudTrail logging
   - Configure AWS Config rules
   - Run AWS Trusted Advisor checks

5. **Performance Testing**
   - Load test with k6 or JMeter
   - Monitor CloudWatch metrics
   - Optimize Lambda memory/timeout
   - Tune DynamoDB capacity

6. **Documentation**
   - Update API documentation
   - Create runbook for operations
   - Document deployment process
   - Write incident response plan

---

## 📞 SUPPORT RESOURCES

- **AWS Application Composer:** https://docs.aws.amazon.com/composer/
- **AWS SAM:** https://docs.aws.amazon.com/serverless-application-model/
- **CloudFormation:** https://docs.aws.amazon.com/cloudformation/
- **Lambda Best Practices:** https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
- **DynamoDB Single-Table Design:** https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/

---

**Last Updated:** January 24, 2026  
**Status:** Ready for Implementation  
**Estimated Completion Time:** 4 weeks (all phases)
