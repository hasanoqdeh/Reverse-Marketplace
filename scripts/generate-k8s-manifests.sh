#!/bin/bash

SERVICES=("request-service:3001" "matching-engine:3002" "bidding-service:3003" "notification-service:3004" "chat-service:3005" "payment-service:3006")

for entry in "${SERVICES[@]}"; do
    NAME=${entry%%:*}
    PORT=${entry#*:}
    
    echo "Generating K8s manifest for $NAME on port $PORT..."
    
    cat <<EOF > "infrastructure/k8s/${NAME}.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${NAME}
  namespace: backend
  labels:
    app: ${NAME}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${NAME}
  template:
    metadata:
      labels:
        app: ${NAME}
    spec:
      containers:
      - name: ${NAME}
        image: reverse-marketplace/${NAME}:latest
        ports:
Would you like me to:
        - containerPort: ${PORT}
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: ${PORT}
          initialDelaySeconds: 60
        readinessProbe:
          httpGet:
            path: /health
            port: ${PORT}
          initialDelaySeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: ${NAME}
  namespace: backend
spec:
  selector:
    app: ${NAME}
  ports:
  - protocol: TCP
    port: 80
    targetPort: ${PORT}
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${NAME}-hpa
  namespace: backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${NAME}
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
EOF
done
