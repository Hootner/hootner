@echo off
echo 🔑 Deploying API Keys for CloudFront Apps...
echo.

echo 📦 Building SAM application...
sam build -t template-with-keys.yaml

echo.
echo 🚀 Deploying to AWS...
sam deploy -t template-with-keys.yaml --stack-name hootner-api-keys --capabilities CAPABILITY_IAM --resolve-s3

echo.
echo 📊 Getting API Key...
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name hootner-api-keys --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayKey'].OutputValue" --output text') do set API_KEY=%%i

echo.
echo ✅ API Key: %API_KEY%
echo.
echo 📋 Next: Upload cloudfront-api-config.js to CloudFront
echo    Then include in all HTML pages
