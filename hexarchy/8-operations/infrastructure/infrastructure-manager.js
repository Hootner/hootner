/**
 * Infrastructure as Code Templates
 * Terraform and CloudFormation templates for deployment
 */

import { createLogger } from '../../0-core/utils/logger.js';
import { containerManager } from '../../1-foundation/containers/container-manager.js';

const logger = createLogger('operations', 'infrastructure');

class InfrastructureManager {
  constructor() {
    this.templates = new Map();
    this.deployments = [];
    
    this._initializeTemplates();
  }

  _initializeTemplates() {
    // AWS CloudFormation template
    this.templates.set('aws-cloudformation', this._getAWSTemplate());
    
    // Terraform template
    this.templates.set('terraform', this._getTerraformTemplate());
    
    // Kubernetes manifests
    this.templates.set('kubernetes', this._getKubernetesTemplate());
    
    // Docker Compose
    this.templates.set('docker-compose', this._getDockerComposeTemplate());
  }

  _getAWSTemplate() {
    return {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: 'Hexarchy Educational Platform Infrastructure',
      Parameters: {
        Environment: {
          Type: 'String',
          Default: 'production',
          AllowedValues: ['development', 'staging', 'production']
        },
        InstanceType: {
          Type: 'String',
          Default: 't3.medium',
          Description: 'EC2 instance type'
        },
        DatabaseInstanceClass: {
          Type: 'String',
          Default: 'db.t3.micro',
          Description: 'RDS instance class'
        }
      },
      Resources: {
        // VPC Configuration
        HexarchyVPC: {
          Type: 'AWS::EC2::VPC',
          Properties: {
            CidrBlock: '10.0.0.0/16',
            EnableDnsHostnames: true,
            EnableDnsSupport: true,
            Tags: [
              { Key: 'Name', Value: 'HexarchyVPC' },
              { Key: 'Environment', Value: { Ref: 'Environment' } }
            ]
          }
        },
        
        // Public Subnets
        PublicSubnet1: {
          Type: 'AWS::EC2::Subnet',
          Properties: {
            VpcId: { Ref: 'HexarchyVPC' },
            CidrBlock: '10.0.1.0/24',
            AvailabilityZone: { 'Fn::Select': [0, { 'Fn::GetAZs': '' }] },
            MapPublicIpOnLaunch: true,
            Tags: [
              { Key: 'Name', Value: 'PublicSubnet1' }
            ]
          }
        },
        
        PublicSubnet2: {
          Type: 'AWS::EC2::Subnet',
          Properties: {
            VpcId: { Ref: 'HexarchyVPC' },
            CidrBlock: '10.0.2.0/24',
            AvailabilityZone: { 'Fn::Select': [1, { 'Fn::GetAZs': '' }] },
            MapPublicIpOnLaunch: true,
            Tags: [
              { Key: 'Name', Value: 'PublicSubnet2' }
            ]
          }
        },
        
        // Private Subnets
        PrivateSubnet1: {
          Type: 'AWS::EC2::Subnet',
          Properties: {
            VpcId: { Ref: 'HexarchyVPC' },
            CidrBlock: '10.0.3.0/24',
            AvailabilityZone: { 'Fn::Select': [0, { 'Fn::GetAZs': '' }] },
            Tags: [
              { Key: 'Name', Value: 'PrivateSubnet1' }
            ]
          }
        },
        
        PrivateSubnet2: {
          Type: 'AWS::EC2::Subnet',
          Properties: {
            VpcId: { Ref: 'HexarchyVPC' },
            CidrBlock: '10.0.4.0/24',
            AvailabilityZone: { 'Fn::Select': [1, { 'Fn::GetAZs': '' }] },
            Tags: [
              { Key: 'Name', Value: 'PrivateSubnet2' }
            ]
          }
        },
        
        // Internet Gateway
        InternetGateway: {
          Type: 'AWS::EC2::InternetGateway',
          Properties: {
            Tags: [
              { Key: 'Name', Value: 'HexarchyIGW' }
            ]
          }
        },
        
        AttachGateway: {
          Type: 'AWS::EC2::VPCGatewayAttachment',
          Properties: {
            VpcId: { Ref: 'HexarchyVPC' },
            InternetGatewayId: { Ref: 'InternetGateway' }
          }
        },
        
        // ECS Cluster
        ECSCluster: {
          Type: 'AWS::ECS::Cluster',
          Properties: {
            ClusterName: 'hexarchy-cluster',
            CapacityProviders: ['FARGATE', 'FARGATE_SPOT'],
            DefaultCapacityProviderStrategy: [
              {
                CapacityProvider: 'FARGATE',
                Weight: 1
              },
              {
                CapacityProvider: 'FARGATE_SPOT',
                Weight: 2
              }
            ],
            Tags: [
              { Key: 'Environment', Value: { Ref: 'Environment' } }
            ]
          }
        },
        
        // RDS Database
        DatabaseSubnetGroup: {
          Type: 'AWS::RDS::DBSubnetGroup',
          Properties: {
            DBSubnetGroupDescription: 'Subnet group for Hexarchy database',
            SubnetIds: [
              { Ref: 'PrivateSubnet1' },
              { Ref: 'PrivateSubnet2' }
            ],
            Tags: [
              { Key: 'Name', Value: 'hexarchy-db-subnet-group' }
            ]
          }
        },
        
        Database: {
          Type: 'AWS::RDS::DBInstance',
          Properties: {
            DBInstanceIdentifier: 'hexarchy-postgres',
            DBInstanceClass: { Ref: 'DatabaseInstanceClass' },
            Engine: 'postgres',
            EngineVersion: '15.3',
            AllocatedStorage: '20',
            StorageType: 'gp2',
            DatabaseName: 'hexarchy',
            MasterUsername: 'hexarchy',
            MasterUserPassword: '{{resolve:secretsmanager:hexarchy-db-password:SecretString:password}}',
            DBSubnetGroupName: { Ref: 'DatabaseSubnetGroup' },
            VPCSecurityGroups: [{ Ref: 'DatabaseSecurityGroup' }],
            BackupRetentionPeriod: 7,
            MultiAZ: { 'Fn::If': ['IsProduction', true, false] },
            StorageEncrypted: true,
            DeletionProtection: { 'Fn::If': ['IsProduction', true, false] },
            Tags: [
              { Key: 'Environment', Value: { Ref: 'Environment' } }
            ]
          }
        },
        
        // ElastiCache Redis
        RedisSubnetGroup: {
          Type: 'AWS::ElastiCache::SubnetGroup',
          Properties: {
            Description: 'Subnet group for Redis cluster',
            SubnetIds: [
              { Ref: 'PrivateSubnet1' },
              { Ref: 'PrivateSubnet2' }
            ]
          }
        },
        
        RedisCluster: {
          Type: 'AWS::ElastiCache::ReplicationGroup',
          Properties: {
            ReplicationGroupDescription: 'Redis cluster for caching',
            ReplicationGroupId: 'hexarchy-redis',
            CacheNodeType: 'cache.t3.micro',
            Engine: 'redis',
            EngineVersion: '7.0',
            NumCacheClusters: 2,
            Port: 6379,
            CacheSubnetGroupName: { Ref: 'RedisSubnetGroup' },
            SecurityGroupIds: [{ Ref: 'RedisSecurityGroup' }],
            AtRestEncryptionEnabled: true,
            TransitEncryptionEnabled: true,
            AutomaticFailoverEnabled: true,
            MultiAZEnabled: true,
            Tags: [
              { Key: 'Environment', Value: { Ref: 'Environment' } }
            ]
          }
        },
        
        // Security Groups
        DatabaseSecurityGroup: {
          Type: 'AWS::EC2::SecurityGroup',
          Properties: {
            GroupDescription: 'Security group for RDS database',
            VpcId: { Ref: 'HexarchyVPC' },
            SecurityGroupIngress: [
              {
                IpProtocol: 'tcp',
                FromPort: 5432,
                ToPort: 5432,
                SourceSecurityGroupId: { Ref: 'ECSSecurityGroup' }
              }
            ],
            Tags: [
              { Key: 'Name', Value: 'DatabaseSecurityGroup' }
            ]
          }
        },
        
        RedisSecurityGroup: {
          Type: 'AWS::EC2::SecurityGroup',
          Properties: {
            GroupDescription: 'Security group for Redis cluster',
            VpcId: { Ref: 'HexarchyVPC' },
            SecurityGroupIngress: [
              {
                IpProtocol: 'tcp',
                FromPort: 6379,
                ToPort: 6379,
                SourceSecurityGroupId: { Ref: 'ECSSecurityGroup' }
              }
            ],
            Tags: [
              { Key: 'Name', Value: 'RedisSecurityGroup' }
            ]
          }
        },
        
        ECSSecurityGroup: {
          Type: 'AWS::EC2::SecurityGroup',
          Properties: {
            GroupDescription: 'Security group for ECS tasks',
            VpcId: { Ref: 'HexarchyVPC' },
            SecurityGroupIngress: [
              {
                IpProtocol: 'tcp',
                FromPort: 80,
                ToPort: 80,
                SourceSecurityGroupId: { Ref: 'LoadBalancerSecurityGroup' }
              },
              {
                IpProtocol: 'tcp',
                FromPort: 3000,
                ToPort: 8000,
                SourceSecurityGroupId: { Ref: 'LoadBalancerSecurityGroup' }
              }
            ],
            Tags: [
              { Key: 'Name', Value: 'ECSSecurityGroup' }
            ]
          }
        },
        
        LoadBalancerSecurityGroup: {
          Type: 'AWS::EC2::SecurityGroup',
          Properties: {
            GroupDescription: 'Security group for Application Load Balancer',
            VpcId: { Ref: 'HexarchyVPC' },
            SecurityGroupIngress: [
              {
                IpProtocol: 'tcp',
                FromPort: 80,
                ToPort: 80,
                CidrIp: '0.0.0.0/0'
              },
              {
                IpProtocol: 'tcp',
                FromPort: 443,
                ToPort: 443,
                CidrIp: '0.0.0.0/0'
              }
            ],
            Tags: [
              { Key: 'Name', Value: 'LoadBalancerSecurityGroup' }
            ]
          }
        },
        
        // Application Load Balancer
        LoadBalancer: {
          Type: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
          Properties: {
            Name: 'hexarchy-alb',
            Scheme: 'internet-facing',
            Type: 'application',
            Subnets: [
              { Ref: 'PublicSubnet1' },
              { Ref: 'PublicSubnet2' }
            ],
            SecurityGroups: [{ Ref: 'LoadBalancerSecurityGroup' }],
            Tags: [
              { Key: 'Environment', Value: { Ref: 'Environment' } }
            ]
          }
        }
      },
      
      Conditions: {
        IsProduction: { 'Fn::Equals': [{ Ref: 'Environment' }, 'production'] }
      },
      
      Outputs: {
        VPCId: {
          Description: 'VPC ID',
          Value: { Ref: 'HexarchyVPC' },
          Export: { Name: { 'Fn::Sub': '${AWS::StackName}-VPCId' } }
        },
        ECSClusterName: {
          Description: 'ECS Cluster Name',
          Value: { Ref: 'ECSCluster' },
          Export: { Name: { 'Fn::Sub': '${AWS::StackName}-ECSCluster' } }
        },
        DatabaseEndpoint: {
          Description: 'RDS Database Endpoint',
          Value: { 'Fn::GetAtt': ['Database', 'Endpoint.Address'] },
          Export: { Name: { 'Fn::Sub': '${AWS::StackName}-DatabaseEndpoint' } }
        },
        RedisEndpoint: {
          Description: 'Redis Cluster Endpoint',
          Value: { 'Fn::GetAtt': ['RedisCluster', 'RedisEndpoint.Address'] },
          Export: { Name: { 'Fn::Sub': '${AWS::StackName}-RedisEndpoint' } }
        },
        LoadBalancerDNS: {
          Description: 'Load Balancer DNS Name',
          Value: { 'Fn::GetAtt': ['LoadBalancer', 'DNSName'] },
          Export: { Name: { 'Fn::Sub': '${AWS::StackName}-LoadBalancerDNS' } }
        }
      }
    };
  }

  _getTerraformTemplate() {
    return `
# Terraform configuration for Hexarchy platform
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

# Provider
provider "aws" {
  region = var.region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC
resource "aws_vpc" "hexarchy" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "hexarchy-vpc"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "hexarchy" {
  vpc_id = aws_vpc.hexarchy.id

  tags = {
    Name        = "hexarchy-igw"
    Environment = var.environment
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = 2

  vpc_id                  = aws_vpc.hexarchy.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "hexarchy-public-subnet-\${count.index + 1}"
    Environment = var.environment
    Type        = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = 2

  vpc_id            = aws_vpc.hexarchy.id
  cidr_block        = "10.0.${count.index + 3}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "hexarchy-private-subnet-\${count.index + 1}"
    Environment = var.environment
    Type        = "Private"
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.hexarchy.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.hexarchy.id
  }

  tags = {
    Name        = "hexarchy-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Groups
resource "aws_security_group" "alb" {
  name_prefix = "hexarchy-alb-"
  vpc_id      = aws_vpc.hexarchy.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "hexarchy-alb-sg"
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "hexarchy" {
  name = "hexarchy-cluster"

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight           = 1
  }

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight           = 2
  }

  tags = {
    Name        = "hexarchy-cluster"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "hexarchy" {
  name               = "hexarchy-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production" ? true : false

  tags = {
    Name        = "hexarchy-alb"
    Environment = var.environment
  }
}

# RDS Database
resource "aws_db_subnet_group" "hexarchy" {
  name       = "hexarchy-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "hexarchy-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "database" {
  name_prefix = "hexarchy-db-"
  vpc_id      = aws_vpc.hexarchy.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name        = "hexarchy-db-sg"
    Environment = var.environment
  }
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.hexarchy.id
}

output "ecs_cluster_name" {
  description = "ECS Cluster Name"
  value       = aws_ecs_cluster.hexarchy.name
}

output "load_balancer_dns" {
  description = "Load Balancer DNS Name"
  value       = aws_lb.hexarchy.dns_name
}
`;
  }

  _getKubernetesTemplate() {
    return containerManager.generateKubernetesManifests();
  }

  _getDockerComposeTemplate() {
    return containerManager.generateDockerCompose();
  }

  /**
   * Deploy infrastructure
   */
  async deployInfrastructure(templateType, environment, options = {}) {
    const deploymentId = `deploy_${templateType}_${Date.now()}`;
    
    const deployment = {
      id: deploymentId,
      templateType,
      environment,
      status: 'deploying',
      startedAt: Date.now(),
      options
    };

    this.deployments.push(deployment);

    logger.info('Starting infrastructure deployment', {
      deploymentId,
      templateType,
      environment
    });

    try {
      const template = this.templates.get(templateType);
      if (!template) {
        throw new Error(`Template not found: ${templateType}`);
      }

      // In real implementation, would use actual deployment tools
      await this._simulateDeployment(templateType, template, options);

      deployment.status = 'success';
      deployment.completedAt = Date.now();

      logger.info('Infrastructure deployment completed', { deploymentId });

      return deployment;
    } catch (error) {
      deployment.status = 'failed';
      deployment.error = error.message;
      
      logger.error('Infrastructure deployment failed', {
        deploymentId,
        error: error.message
      });

      throw error;
    }
  }

  async _simulateDeployment(templateType, template, options) {
    // Simulate deployment steps
    const steps = [
      'Validating template',
      'Creating resources',
      'Configuring networking',
      'Setting up security groups',
      'Deploying services',
      'Running health checks'
    ];

    for (const step of steps) {
      logger.info(`Deployment step: ${step}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
    }
  }

  /**
   * Get available templates
   */
  getTemplates() {
    return Array.from(this.templates.keys());
  }

  /**
   * Get template content
   */
  getTemplate(templateType) {
    return this.templates.get(templateType);
  }

  /**
   * Get deployment history
   */
  getDeployments(limit = 10) {
    return this.deployments
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limit);
  }

  /**
   * Get infrastructure statistics
   */
  getStats() {
    return {
      totalTemplates: this.templates.size,
      totalDeployments: this.deployments.length,
      successfulDeployments: this.deployments.filter(d => d.status === 'success').length,
      failedDeployments: this.deployments.filter(d => d.status === 'failed').length,
      recentDeployments: this.getDeployments(5)
    };
  }
}

export const infrastructureManager = new InfrastructureManager();
export default infrastructureManager;