#!/bin/bash
# Blue-Green Deployment Script with Istio Traffic Shifting

set -e

NAMESPACE="hootner"
APP="hootner-frontend"
CURRENT_VERSION=""
NEW_VERSION=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== HOOTNER Blue-Green Deployment ===${NC}"

# Step 1: Detect current active version
echo -e "${YELLOW}Step 1: Detecting current active version...${NC}"
BLUE_WEIGHT=$(kubectl get virtualservice "${APP}" -n "${NAMESPACE}" -o jsonpath='{.spec.http[0].route[?(@.destination.subset=="blue")].weight}' 2>/dev/null || echo "0")
GREEN_WEIGHT=$(kubectl get virtualservice "${APP}" -n "${NAMESPACE}" -o jsonpath='{.spec.http[0].route[?(@.destination.subset=="green")].weight}' 2>/dev/null || echo "0")

if [ "$BLUE_WEIGHT" -gt "$GREEN_WEIGHT" ]; then
    CURRENT_VERSION="blue"
    NEW_VERSION="green"
    echo -e "${GREEN}Current active version: BLUE (${BLUE_WEIGHT}%)${NC}"
else
    CURRENT_VERSION="green"
    NEW_VERSION="blue"
    echo -e "${GREEN}Current active version: GREEN (${GREEN_WEIGHT}%)${NC}"
fi

echo -e "${YELLOW}Deploying new version: ${NEW_VERSION^^}${NC}"

# Step 2: Deploy new version
echo -e "${YELLOW}Step 2: Deploying ${NEW_VERSION} version...${NC}"
NEW_IMAGE_TAG="hootner/frontend:${NEW_VERSION}-$(date +%s)"
kubectl set image "deployment/${APP}-${NEW_VERSION}" \
    "frontend=${NEW_IMAGE_TAG}" \
    -n "${NAMESPACE}"

echo "Waiting for rollout to complete..."
if ! kubectl rollout status "deployment/${APP}-${NEW_VERSION}" -n "${NAMESPACE}" --timeout=5m; then
    echo -e "${RED}Rollout failed! Aborting deployment.${NC}"
    exit 1
fi

# Step 3: Wait for pods to be ready
echo -e "${YELLOW}Step 3: Waiting for pods to be ready...${NC}"
if ! kubectl wait --for=condition=ready pod \
    -l "app=${APP},version=${NEW_VERSION}" \
    -n "${NAMESPACE}" \
    --timeout=5m; then
    echo -e "${RED}Pods not ready! Aborting deployment.${NC}"
    exit 1
fi

# Step 4: Run smoke tests
echo -e "${YELLOW}Step 4: Running smoke tests...${NC}"
if [ -f "./scripts/smoke-test.sh" ]; then
    if ! ./scripts/smoke-test.sh "${NEW_VERSION}"; then
        echo -e "${RED}Smoke tests failed! Rolling back...${NC}"
        kubectl rollout undo "deployment/${APP}-${NEW_VERSION}" -n "${NAMESPACE}"
        exit 1
    fi
else
    echo -e "${YELLOW}Warning: smoke-test.sh not found, skipping smoke tests${NC}"
fi

echo -e "${GREEN}Smoke tests passed!${NC}"

# Step 5: Progressive traffic shift
echo -e "${YELLOW}Step 5: Progressively shifting traffic to ${NEW_VERSION}...${NC}"

# Shift 10% traffic
echo "Shifting 10% traffic to ${NEW_VERSION}..."
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: ${APP}
  namespace: ${NAMESPACE}
spec:
  hosts:
  - ${APP}
  http:
  - route:
    - destination:
        host: ${APP}
        subset: ${CURRENT_VERSION}
      weight: 90
    - destination:
        host: ${APP}
        subset: ${NEW_VERSION}
      weight: 10
EOF

echo "Monitoring for 2 minutes..."
sleep 120

# Check error rate (optional, requires Prometheus)
if command -v jq &> /dev/null && command -v bc &> /dev/null; then
    PROM_POD=$(kubectl get pod -n istio-system -l app=prometheus -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    if [ -n "${PROM_POD}" ]; then
        ERROR_RATE=$(kubectl exec -n istio-system "${PROM_POD}" \
            -- curl -s "http://localhost:9090/api/v1/query?query=rate(istio_requests_total{destination_service=\"${APP}\",response_code=~\"5..\"}[1m])" \
            2>/dev/null | jq -r '.data.result[0].value[1]' 2>/dev/null || echo "0")

        if (( $(echo "${ERROR_RATE} > 0.01" | bc -l 2>/dev/null || echo "0") )); then
            echo -e "${RED}High error rate detected (${ERROR_RATE})! Rolling back...${NC}"
            kubectl apply -f k8s/istio/virtual-service.yaml
            exit 1
        fi
    else
        echo -e "${YELLOW}Warning: Prometheus not found, skipping error rate check${NC}"
    fi
else
    echo -e "${YELLOW}Warning: jq or bc not found, skipping error rate check${NC}"
fi

# Shift 50% traffic
echo "Shifting 50% traffic to ${NEW_VERSION}..."
kubectl patch virtualservice ${APP} -n ${NAMESPACE} --type merge -p '{
  "spec": {
    "http": [{
      "route": [
        {"destination": {"host": "'${APP}'", "subset": "'${CURRENT_VERSION}'"}, "weight": 50},
        {"destination": {"host": "'${APP}'", "subset": "'${NEW_VERSION}'"}, "weight": 50}
      ]
    }]
  }
}'

echo "Monitoring for 2 minutes..."
sleep 120

# Shift 100% traffic
echo "Shifting 100% traffic to ${NEW_VERSION}..."
kubectl patch virtualservice ${APP} -n ${NAMESPACE} --type merge -p '{
  "spec": {
    "http": [{
      "route": [
        {"destination": {"host": "'${APP}'", "subset": "'${NEW_VERSION}'"}, "weight": 100}
      ]
    }]
  }
}'

echo -e "${GREEN}✓ Deployment complete! ${NEW_VERSION^^} is now receiving 100% traffic${NC}"

# Step 6: Scale down old version
echo -e "${YELLOW}Step 6: Scaling down ${CURRENT_VERSION} version...${NC}"
kubectl scale "deployment/${APP}-${CURRENT_VERSION}" --replicas=1 -n "${NAMESPACE}"

echo -e "${GREEN}=== Deployment Summary ===${NC}"
echo -e "Active Version: ${GREEN}${NEW_VERSION^^}${NC}"
echo -e "Previous Version: ${YELLOW}${CURRENT_VERSION^^} (scaled to 1 replica)${NC}"
echo -e "Traffic Split: ${GREEN}${NEW_VERSION}: 100%, ${CURRENT_VERSION}: 0%${NC}"

# Optional: Monitor for issues
echo -e "${YELLOW}Monitoring deployment for next 5 minutes...${NC}"
echo "Press Ctrl+C to exit monitoring, or wait for auto-exit"

for i in {1..5}; do
    echo "Minute $i/5..."
    kubectl top pods -n "${NAMESPACE}" -l "app=${APP}" 2>/dev/null || echo "Metrics not available"
    sleep 60
done

echo -e "${GREEN}=== Deployment Successfully Completed ===${NC}"
