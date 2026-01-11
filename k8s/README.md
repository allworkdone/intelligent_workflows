# Kubernetes Deployment

Quick reference for deploying GenAI Stack on Kubernetes.

## Prerequisites

- Kubernetes cluster (minikube, GKE, EKS, AKS)
- kubectl configured
- Docker images built and pushed to registry

## Quick Deploy

```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Configure secrets (IMPORTANT: Update secrets.yaml first!)
kubectl apply -f secrets.yaml

# 3. Apply ConfigMap
kubectl apply -f configmap.yaml

# 4. Deploy database
kubectl apply -f postgres-deployment.yaml

# 5. Deploy backend
kubectl apply -f backend-deployment.yaml

# 6. Deploy frontend
kubectl apply -f frontend-deployment.yaml

# 7. Check status
kubectl get pods -n genai-stack
kubectl get svc -n genai-stack
```

## Before Deploying

### 1. Update Secrets

Edit `secrets.yaml` and replace placeholder values with your base64-encoded API keys:

```bash
# Encode your keys
echo -n "sk-your-openai-key" | base64
echo -n "your-google-key" | base64
echo -n "your-serpapi-key" | base64

# Update secrets.yaml with the output
```

### 2. Update Image References

Edit deployment files to use your container registry:

```yaml
# In frontend-deployment.yaml and backend-deployment.yaml
image: your-registry/genai-stack-frontend:v1.0.0
image: your-registry/genai-stack-backend:v1.0.0
```

## Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n genai-stack

# Expected output:
# NAME                        READY   STATUS    RESTARTS   AGE
# backend-xxxxx               1/1     Running   0          2m
# frontend-xxxxx              1/1     Running   0          1m
# postgres-0                  1/1     Running   0          3m

# Check services
kubectl get svc -n genai-stack

# View logs
kubectl logs -f -l app=backend -n genai-stack
```

## Access Application

### LoadBalancer
```bash
kubectl get svc frontend-service -n genai-stack
# Use EXTERNAL-IP to access
```

### NodePort
```bash
# Edit frontend-deployment.yaml to use NodePort
# Access at http://<node-ip>:30080
```

### minikube
```bash
minikube service frontend-service -n genai-stack
```

## Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n genai-stack

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n genai-stack
```

## Cleanup

```bash
# Delete all resources
kubectl delete namespace genai-stack

# Or delete individual resources
kubectl delete -f .
```

## Troubleshooting

```bash
# View pod status
kubectl describe pod <pod-name> -n genai-stack

# View logs
kubectl logs <pod-name> -n genai-stack

# Execute commands in pod
kubectl exec -it <pod-name> -n genai-stack -- /bin/sh

# Port forward for debugging
kubectl port-forward svc/backend-service 8000:8000 -n genai-stack
```

For detailed deployment instructions, see [../DEPLOYMENT.md](../DEPLOYMENT.md).
