# My Bookstore App - Database & Cloud Project

This is my term project for the Database and Cloud Systems course. It's a Flask app that connects to MongoDB running on Kubernetes.

## What I Built

- A Python/Flask REST API for managing books
- MongoDB database deployed with Kubernetes StatefulSet
- Everything containerized with Docker

## Project Files

```
bookstore-k8s-project/
├── bookstore_server.py        # my main flask application
├── requirements.txt           # python packages i need
├── Dockerfile                 # for building the container
└── kubernetes/
    ├── mongo-config.yaml      # mongodb connection settings
    ├── mongo-db.yaml          # mongodb statefulset
    ├── mongo-svc.yaml         # mongodb service
    ├── flask-deploy.yaml      # my app deployment
    └── flask-service.yaml     # expose my app
```

## How to Run It

### Prerequisites
- Docker Desktop with Kubernetes enabled
- kubectl installed

### Step 1 - Build the Docker image
```bash
docker build -t bookstore-app:latest .
```

### Step 2 - Deploy MongoDB first
```bash
kubectl apply -f kubernetes/mongo-db.yaml
kubectl apply -f kubernetes/mongo-svc.yaml
kubectl wait --for=condition=ready pod/mongodb-0 --timeout=120s
```

### Step 3 - Deploy my Flask app
```bash
kubectl apply -f kubernetes/mongo-config.yaml
kubectl apply -f kubernetes/flask-deploy.yaml
kubectl apply -f kubernetes/flask-service.yaml
```

### Step 4 - Check everything is running
```bash
kubectl get pods
```

Both pods should show `Running` status.

## Testing the API

The app runs on `http://localhost:8080`

### Health check
```bash
curl http://localhost:8080/health
```

### Add a book
```bash
curl -X POST http://localhost:8080/books \
  -H "Content-Type: application/json" \
  -d '{"title": "1984", "author": "George Orwell", "price": 9.99}'
```

### Get all books
```bash
curl http://localhost:8080/books
```

### Update a book
```bash
curl -X PUT http://localhost:8080/books/<id> \
  -H "Content-Type: application/json" \
  -d '{"price": 12.99}'
```

### Delete a book
```bash
curl -X DELETE http://localhost:8080/books/<id>
```

## MongoDB Settings

- Database: BOOKSTORE
- Username: admin
- Password: admin
- Port: 27017

## Cleanup

To remove everything:
```bash
kubectl delete -f kubernetes/
```

## What I Learned

- How to containerize apps with Docker
- Kubernetes deployments and services
- StatefulSets for databases
- Service discovery between containers
- REST API development with Flask
- MongoDB CRUD operations
