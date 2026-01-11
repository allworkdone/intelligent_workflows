# Deployment Guide

This guide covers deploying the GenAI Stack application in various environments.

## Table of Contents

- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [Scaling Considerations](#scaling-considerations)
- [Monitoring Setup (Optional)](#monitoring-setup-optional)

---

## Docker Deployment

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB available RAM
- API keys for OpenAI/Gemini

### Quick Deployment

1. **Clone and navigate**
   ```bash
   git clone <repository-url>
   cd assignment
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   nano .env
   ```

3. **Start services**
   ```bash
   docker-compose up -d --build
   ```

4. **Verify deployment**
   ```bash
   # Check all containers are running
   docker-compose ps
   
   # Check backend health
   curl http://localhost:8000/api/health
   
   # Access frontend
   open http://localhost:5173
   ```

### Production Docker Deployment

For production, add additional security and monitoring:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - genai-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  backend:
    build: ./backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/genai_stack
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - SERPAPI_KEY=${SERPAPI_KEY}
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/chroma_data:/app/chroma_data
    depends_on:
      - db
    networks:
      - genai-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=genai_stack
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - genai-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  genai-network:
    driver: bridge

volumes:
  postgres_data:
```

Deploy with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, GKE, EKS, AKS)
- kubectl configured
- Container registry access (Docker Hub, GCR, ECR, ACR)

### Step 1: Build and Push Images

```bash
# Tag images
docker tag assignment-frontend:latest your-registry/genai-stack-frontend:v1.0.0
docker tag assignment-backend:latest your-registry/genai-stack-backend:v1.0.0

# Push to registry
docker push your-registry/genai-stack-frontend:v1.0.0
docker push your-registry/genai-stack-backend:v1.0.0
```

### Step 2: Update Kubernetes Manifests

Edit `k8s/frontend-deployment.yaml` and `k8s/backend-deployment.yaml`:

```yaml
# Update image references
image: your-registry/genai-stack-frontend:v1.0.0
image: your-registry/genai-stack-backend:v1.0.0
```

### Step 3: Configure Secrets

**Important**: Update `k8s/secrets.yaml` with your actual API keys:

```bash
# Encode your API keys
echo -n "sk-your-openai-key" | base64
echo -n "your-google-key" | base64
echo -n "your-serpapi-key" | base64

# Update k8s/secrets.yaml with the base64-encoded values
```

### Step 4: Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy secrets and config
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml

# Deploy database
kubectl apply -f k8s/postgres-deployment.yaml

# Wait for database to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n genai-stack --timeout=120s

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n genai-stack --timeout=120s

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
```

### Step 5: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n genai-stack

# Check services
kubectl get svc -n genai-stack

# View logs
kubectl logs -f -l app=backend -n genai-stack
kubectl logs -f -l app=frontend -n genai-stack

# Get frontend URL
kubectl get svc frontend-service -n genai-stack
```

### Step 6: Access the Application

**For LoadBalancer:**
```bash
kubectl get svc frontend-service -n genai-stack
# Use EXTERNAL-IP to access the application
```

**For NodePort (local testing):**
```bash
# Edit frontend-deployment.yaml to use NodePort
# Then access at: http://<node-ip>:30080
```

**For minikube:**
```bash
minikube service frontend-service -n genai-stack
```

---

## Local Kubernetes Testing (minikube)

### Setup minikube

```bash
# Install minikube (macOS)
brew install minikube

# Start minikube
minikube start --memory=8192 --cpus=4

# Enable metrics
minikube addons enable metrics-server

# Use minikube's Docker daemon
eval $(minikube docker-env)

# Build images directly in minikube
cd frontend && docker build -t genai-stack-frontend:latest .
cd ../backend && docker build -t genai-stack-backend:latest .
```

### Deploy to minikube

```bash
# Update manifests to use local images
# Change imagePullPolicy to Never in deployment files

# Deploy as normal
kubectl apply -f k8s/

# Access the application
minikube service frontend-service -n genai-stack
```

### Cleanup

```bash
# Delete all resources
kubectl delete namespace genai-stack

# Or delete individual resources
kubectl delete -f k8s/
```

---

## Cloud Deployment

### Google Kubernetes Engine (GKE)

```bash
# Create GKE cluster
gcloud container clusters create genai-stack-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2

# Get credentials
gcloud container clusters get-credentials genai-stack-cluster --zone us-central1-a

# Build and push to Google Container Registry
docker tag assignment-frontend:latest gcr.io/YOUR_PROJECT_ID/genai-stack-frontend:v1.0.0
docker tag assignment-backend:latest gcr.io/YOUR_PROJECT_ID/genai-stack-backend:v1.0.0

gcloud docker -- push gcr.io/YOUR_PROJECT_ID/genai-stack-frontend:v1.0.0
gcloud docker -- push gcr.io/YOUR_PROJECT_ID/genai-stack-backend:v1.0.0

# Update manifests with GCR images
# Deploy as normal
kubectl apply -f k8s/
```

### Amazon EKS

```bash
# Create EKS cluster
eksctl create cluster \
  --name genai-stack-cluster \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3

# Build and push to ECR
aws ecr create-repository --repository-name genai-stack-frontend
aws ecr create-repository --repository-name genai-stack-backend

# Authenticate Docker to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com

# Tag and push
docker tag assignment-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/genai-stack-frontend:v1.0.0
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/genai-stack-frontend:v1.0.0

# Deploy
kubectl apply -f k8s/
```

---

## Environment Configuration

### Environment Variables Reference

#### Backend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `GOOGLE_API_KEY` | Google Gemini API key | Yes | - |
| `SERPAPI_KEY` | SerpAPI key for web search | No | - |
| `APP_NAME` | Application name | No | "GenAI Stack" |
| `UPLOAD_DIR` | Directory for uploaded files | No | "/app/uploads" |
| `CHROMA_DIR` | ChromaDB data directory | No | "/app/chroma_data" |

#### Frontend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | Yes | "http://localhost:8000" |

### Secrets Management

**Development:**
- Use `.env` file (not committed to git)

**Production (Docker):**
- Use Docker secrets or environment variables
- Encrypt sensitive files

**Production (Kubernetes):**
- Use Kubernetes Secrets
- Consider external secret management (Vault, AWS Secrets Manager, etc.)

```bash
# Example: Using Kubernetes external secrets
kubectl create secret generic genai-stack-secrets \
  --from-literal=OPENAI_API_KEY="sk-..." \
  --from-literal=GOOGLE_API_KEY="..." \
  --from-literal=SERPAPI_KEY="..." \
  -n genai-stack
```

---

## Scaling Considerations

### Horizontal Scaling

#### Backend
```yaml
# Increase replicas in backend-deployment.yaml
spec:
  replicas: 5  # Scale to 5 instances
```

**Important:** When scaling backend:
- Use external vector store (not embedded ChromaDB) for production
- Configure session affinity for ChromaDB operations
- Use shared storage (NFS, S3) for uploads

#### Frontend
```yaml
# Increase replicas in frontend-deployment.yaml
spec:
  replicas: 3  # Scale to 3 instances
```

### Vertical Scaling

Increase resource limits:

```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "1000m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

### Auto-scaling

```yaml
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: genai-stack
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Monitoring Setup (Optional)

### Prometheus and Grafana

1. **Install Prometheus Operator:**
   ```bash
   kubectl create namespace monitoring
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
   ```

2. **Expose Grafana:**
   ```bash
   kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
   # Access at http://localhost:3000
   # Default: admin/prom-operator
   ```

3. **Add application metrics:**
   ```python
   # backend/app/main.py
   from prometheus_fastapi_instrumentator import Instrumentator
   
   app = FastAPI()
   Instrumentator().instrument(app).expose(app)
   ```

4. **Create ServiceMonitor:**
   ```yaml
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: backend-metrics
     namespace: genai-stack
   spec:
     selector:
       matchLabels:
         app: backend
     endpoints:
     - port: http
       path: /metrics
   ```

### ELK Stack (Optional)

For centralized logging, deploy the ELK stack and configure log forwarding from all pods.

---

## Backup and Disaster Recovery

### Database Backups

```bash
# Create backup
kubectl exec -it postgres-0 -n genai-stack -- pg_dump -U postgres genai_stack > backup.sql

# Restore backup
kubectl exec -i postgres-0 -n genai-stack -- psql -U postgres genai_stack < backup.sql
```

### Automated Backups

Use CronJob for scheduled backups:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: genai-stack
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            command:
            - /bin/sh
            - -c
            - pg_dump -h postgres-service -U postgres genai_stack > /backup/backup-$(date +%Y%m%d).sql
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: genai-stack-secrets
                  key: POSTGRES_PASSWORD
            volumeMounts:
            - name: backup-volume
              mountPath: /backup
          restartPolicy: OnFailure
          volumes:
          - name: backup-volume
            persistentVolumeClaim:
              claimName: backup-pvc
```

---

## Troubleshooting

### Common Kubernetes Issues

**Pods in CrashLoopBackOff:**
```bash
# Check logs
kubectl logs <pod-name> -n genai-stack

# Describe pod for events
kubectl describe pod <pod-name> -n genai-stack
```

**ImagePullBackOff:**
- Verify image name and registry
- Check imagePullSecrets if using private registry
- Ensure images are pushed to registry

**Database Connection Errors:**
```bash
# Verify database is running
kubectl get pods -l app=postgres -n genai-stack

# Check database logs
kubectl logs -l app=postgres -n genai-stack

# Test connection from backend pod
kubectl exec -it <backend-pod> -n genai-stack -- nc -zv postgres-service 5432
```

**PVC Pending:**
- Check if storage class exists
- Verify cluster has available storage
- Check PVC events: `kubectl describe pvc <pvc-name> -n genai-stack`

---

## Performance Tuning

### Database Optimization

```sql
-- Increase shared_buffers for better caching
ALTER SYSTEM SET shared_buffers = '256MB';

-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Analyze tables
ANALYZE;
```

### Backend Optimization

```python
# Increase uvicorn workers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Nginx Optimization (Frontend)

```nginx
# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Browser caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Next Steps

- Set up CI/CD pipeline for automated deployments
- Configure SSL/TLS certificates
- Implement rate limiting
- Set up monitoring and alerting
- Configure backup automation
- Implement blue-green or canary deployments

For more information, see the [Architecture Documentation](./ARCHITECTURE.md).
