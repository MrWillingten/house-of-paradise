#!/bin/bash

echo "🚀 Deploying Travel Booking Microservices to Kubernetes"
echo "========================================================="

# Build Docker images
echo "📦 Building Docker images..."
docker build -t hotel-service:latest ./hotel-service
docker build -t trip-service:latest ./trip-service
docker build -t payment-service:latest ./payment-service
docker build -t api-gateway:latest ./api-gateway

echo "✅ Docker images built successfully"

# Deploy to Kubernetes
echo "☸️  Deploying to Kubernetes..."
kubectl apply -f k8s/

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment --all -n travel-booking

# Show status
echo "📊 Deployment Status:"
kubectl get all -n travel-booking

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 API Gateway URL: http://localhost:30080"
echo "🏥 Health Check: http://localhost:30080/health"
echo ""
echo "To view logs:"
echo "  kubectl logs -f -n travel-booking deployment/hotel-service"
echo "  kubectl logs -f -n travel-booking deployment/trip-service"
echo "  kubectl logs -f -n travel-booking deployment/payment-service"
echo "  kubectl logs -f -n travel-booking deployment/api-gateway"