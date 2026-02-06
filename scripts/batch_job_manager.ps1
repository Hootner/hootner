# PowerShell script to submit AWS Batch render jobs
# Direct AWS CLI approach to bypass Python issues

param(
    [string]$Action = "submit",
    [string]$JobId = "",
    [string]$Bucket = "hootner-frontend-504165876439",
    [string]$Queue = "hootner-render-queue",
    [string]$Definition = "hootner-gpu-render-job"
)

function Submit-RenderJob {
    param($Bucket, $Queue, $Definition)
    
    # Generate unique job name
    $JobName = "hootner-render-ps-$(Get-Random -Maximum 9999)"
    $Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    
    Write-Host "🚀 Submitting render job: $JobName" -ForegroundColor Green
    Write-Host "   Bucket: $Bucket" -ForegroundColor Cyan
    Write-Host "   Queue: $Queue" -ForegroundColor Cyan
    Write-Host "   Job Definition: $Definition" -ForegroundColor Cyan
    
    # Check if training prompts exist
    try {
        aws s3api head-object --bucket $Bucket --key "training_prompts.json" | Out-Null
        Write-Host "✅ Found training prompts in S3" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Training prompts not found in s3://$Bucket/training_prompts.json" -ForegroundColor Red
        Write-Host "   Upload prompts first: aws s3 cp offline_renders/prompts.json s3://$Bucket/training_prompts.json" -ForegroundColor Yellow
        return $false
    }
    
    # Create job parameters JSON
    $JobParams = @{
        jobName = $JobName
        jobQueue = $Queue
        jobDefinition = $Definition
        parameters = @{
            triggerType = "powershell"
            timestamp = $Timestamp
            submittedBy = "powershell-script"
        }
        containerOverrides = @{
            environment = @(
                @{ name = "JOB_NAME"; value = $JobName },
                @{ name = "SUBMISSION_TIME"; value = $Timestamp },
                @{ name = "S3_BUCKET"; value = $Bucket }
            )
        }
        retryStrategy = @{
            attempts = 2
        }
        timeout = @{
            attemptDurationSeconds = 7200
        }
        tags = @{
            Project = "HOOTNER"
            JobType = "Render"
            TriggerType = "PowerShell"
            SubmittedBy = "CLI"
        }
    } | ConvertTo-Json -Depth 4
    
    # Submit job via AWS CLI
    try {
        Write-Host "🔄 Submitting to AWS Batch..." -ForegroundColor Yellow
        
        # Save params to temp file (AWS CLI needs file for complex JSON)
        $TempFile = "$env:TEMP\batch-params-$(Get-Random).json"
        $JobParams | Out-File -FilePath $TempFile -Encoding UTF8
        
        $Result = aws batch submit-job --cli-input-json "file://$TempFile" | ConvertFrom-Json
        
        Remove-Item $TempFile -Force
        
        Write-Host "✅ Job submitted successfully!" -ForegroundColor Green
        Write-Host "   Job ID: $($Result.jobId)" -ForegroundColor Cyan
        Write-Host "   Job ARN: $($Result.jobArn)" -ForegroundColor Cyan
        Write-Host "   Job Name: $($Result.jobName)" -ForegroundColor Cyan
        
        return $true
    }
    catch {
        Write-Host "❌ Failed to submit job: $($_.Exception.Message)" -ForegroundColor Red
        if (Test-Path $TempFile) { Remove-Item $TempFile -Force }
        return $false
    }
}

function Get-JobStatus {
    param($JobId)
    
    if (-not $JobId) {
        Write-Host "❌ Job ID required for status check" -ForegroundColor Red
        return $false
    }
    
    try {
        $Jobs = aws batch describe-jobs --jobs $JobId | ConvertFrom-Json
        
        if ($Jobs.jobs.Count -gt 0) {
            $Job = $Jobs.jobs[0]
            
            Write-Host "📊 Job Status: $($Job.jobName) ($JobId)" -ForegroundColor Green
            Write-Host "   Status: $($Job.status)" -ForegroundColor Cyan
            Write-Host "   Created: $($Job.createdAt)" -ForegroundColor Cyan
            
            if ($Job.startedAt) {
                Write-Host "   Started: $($Job.startedAt)" -ForegroundColor Cyan
            }
            if ($Job.stoppedAt) {
                Write-Host "   Stopped: $($Job.stoppedAt)" -ForegroundColor Cyan
            }
            if ($Job.statusReason) {
                Write-Host "   Reason: $($Job.statusReason)" -ForegroundColor Cyan
            }
            
            return $true
        } else {
            Write-Host "❌ Job not found: $JobId" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Failed to get job status: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Get-RecentJobs {
    try {
        Write-Host "📋 Recent Batch Jobs:" -ForegroundColor Green
        
        # Get jobs from the queue
        $Jobs = aws batch list-jobs --job-queue $Queue --max-results 10 | ConvertFrom-Json
        
        if ($Jobs.jobList.Count -gt 0) {
            foreach ($Job in $Jobs.jobList) {
                $StatusEmoji = switch ($Job.status) {
                    "SUBMITTED" { "📝" }
                    "PENDING" { "⏳" }
                    "RUNNABLE" { "🚀" }
                    "STARTING" { "▶️" }
                    "RUNNING" { "🔄" }
                    "SUCCEEDED" { "✅" }
                    "FAILED" { "❌" }
                    default { "❓" }
                }
                
                $JobIdShort = $Job.jobId.Substring(0, 8)
                Write-Host "   $StatusEmoji $($Job.jobName) - $($Job.status) ($JobIdShort...)" -ForegroundColor Cyan
            }
        } else {
            Write-Host "   No jobs found in queue" -ForegroundColor Yellow
        }
        
        return $true
    }
    catch {
        Write-Host "❌ Failed to list jobs: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main script logic
Write-Host "🦉 HOOTNER Batch Job Manager (PowerShell Edition)" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta

switch ($Action.ToLower()) {
    "submit" {
        Submit-RenderJob -Bucket $Bucket -Queue $Queue -Definition $Definition
    }
    "status" {
        Get-JobStatus -JobId $JobId
    }
    "list" {
        Get-RecentJobs
    }
    default {
        Write-Host "❌ Invalid action. Use: submit, status, list" -ForegroundColor Red
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "   .\batch_job_manager.ps1 submit" -ForegroundColor White
        Write-Host "   .\batch_job_manager.ps1 status -JobId abc123def456" -ForegroundColor White
        Write-Host "   .\batch_job_manager.ps1 list" -ForegroundColor White
    }
}