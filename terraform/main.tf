# HOOTNER Enterprise Platform - Terraform Infrastructure
# Production-ready AWS infrastructure as code

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }

  backend "s3" {
    # Configure your S3 backend
    # bucket = "hootner-terraform-state"
    # key    = "infrastructure/terraform.tfstate"
    # region = "us-west-2"
  }
}

# Variables
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "hootner.com"
}

# Provider
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "HOOTNER"
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Random suffix for unique resource names
resource "random_id" "suffix" {
  byte_length = 4
}

# VPC
resource "aws_vpc" "hootner" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "hootner-vpc-${var.environment}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "hootner" {
  vpc_id = aws_vpc.hootner.id

  tags = {
    Name = "hootner-igw-${var.environment}"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = 2

  vpc_id                  = aws_vpc.hootner.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "hootner-public-subnet-${count.index + 1}-${var.environment}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = 2

  vpc_id            = aws_vpc.hootner.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "hootner-private-subnet-${count.index + 1}-${var.environment}"
    Type = "Private"
  }
}

# NAT Gateways
resource "aws_eip" "nat" {
  count = 2

  domain = "vpc"
  depends_on = [aws_internet_gateway.hootner]

  tags = {
    Name = "hootner-nat-eip-${count.index + 1}-${var.environment}"
  }
}

resource "aws_nat_gateway" "hootner" {
  count = 2

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "hootner-nat-gateway-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.hootner]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.hootner.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.hootner.id
  }

  tags = {
    Name = "hootner-public-rt-${var.environment}"
  }
}

resource "aws_route_table" "private" {
  count = 2

  vpc_id = aws_vpc.hootner.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.hootner[count.index].id
  }

  tags = {
    Name = "hootner-private-rt-${count.index + 1}-${var.environment}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count = 2

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = 2

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security Groups
resource "aws_security_group" "alb" {
  name_prefix = "hootner-alb-${var.environment}-"
  vpc_id      = aws_vpc.hootner.id

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
    Name = "hootner-alb-sg-${var.environment}"
  }
}

resource "aws_security_group" "ecs" {
  name_prefix = "hootner-ecs-${var.environment}-"
  vpc_id      = aws_vpc.hootner.id

  ingress {
    from_port       = 3000
    to_port         = 5004
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "hootner-ecs-sg-${var.environment}"
  }
}

resource "aws_security_group" "database" {
  name_prefix = "hootner-db-${var.environment}-"
  vpc_id      = aws_vpc.hootner.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "hootner-db-sg-${var.environment}"
  }
}

resource "aws_security_group" "redis" {
  name_prefix = "hootner-redis-${var.environment}-"
  vpc_id      = aws_vpc.hootner.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "hootner-redis-sg-${var.environment}"
  }
}

# Application Load Balancer
resource "aws_lb" "hootner" {
  name               = "hootner-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production" ? true : false

  tags = {
    Name = "hootner-alb-${var.environment}"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "hootner" {
  name = "hootner-cluster-${var.environment}"

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
    Name = "hootner-cluster-${var.environment}"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "hootner" {
  name       = "hootner-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "hootner-db-subnet-group-${var.environment}"
  }
}

# RDS Database
resource "aws_db_instance" "hootner" {
  identifier     = "hootner-db-${var.environment}"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "hootner"
  username = "hootner"
  password = "hootner123" # Use AWS Secrets Manager in production

  db_subnet_group_name   = aws_db_subnet_group.hootner.name
  vpc_security_group_ids = [aws_security_group.database.id]

  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  multi_az               = var.environment == "production" ? true : false
  publicly_accessible    = false
  deletion_protection    = var.environment == "production" ? true : false
  skip_final_snapshot    = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "hootner-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  tags = {
    Name = "hootner-db-${var.environment}"
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "hootner" {
  name       = "hootner-redis-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private[*].id
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "hootner" {
  replication_group_id       = "hootner-redis-${var.environment}"
  description                = "Redis cluster for HOOTNER ${var.environment}"

  node_type            = "cache.t3.micro"
  port                 = 6379
  parameter_group_name = "default.redis7"

  num_cache_clusters = var.environment == "production" ? 2 : 1
  
  subnet_group_name  = aws_elasticache_subnet_group.hootner.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = "hootner-redis-auth-token-123"

  automatic_failover_enabled = var.environment == "production" ? true : false
  multi_az_enabled          = var.environment == "production" ? true : false

  tags = {
    Name = "hootner-redis-${var.environment}"
  }
}

# S3 Bucket for static assets
resource "aws_s3_bucket" "hootner_assets" {
  bucket = "hootner-assets-${var.environment}-${random_id.suffix.hex}"

  tags = {
    Name = "hootner-assets-${var.environment}"
  }
}

resource "aws_s3_bucket_versioning" "hootner_assets" {
  bucket = aws_s3_bucket.hootner_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "hootner_assets" {
  bucket = aws_s3_bucket.hootner_assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "hootner" {
  name              = "/ecs/hootner-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7

  tags = {
    Name = "hootner-logs-${var.environment}"
  }
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.hootner.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = aws_ecs_cluster.hootner.name
}

output "ecs_cluster_arn" {
  description = "ECS Cluster ARN"
  value       = aws_ecs_cluster.hootner.arn
}

output "database_endpoint" {
  description = "RDS Database endpoint"
  value       = aws_db_instance.hootner.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.hootner.primary_endpoint_address
  sensitive   = true
}

output "load_balancer_dns" {
  description = "Load Balancer DNS name"
  value       = aws_lb.hootner.dns_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for assets"
  value       = aws_s3_bucket.hootner_assets.bucket
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.hootner.name
}