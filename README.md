# Persona FrontEnd

React and Vite storefront for the Persona demo shop. Nginx serves the built app and forwards `/api` requests to the backend.

## Run with Docker

Build this image from the repository root:

```bash
docker build -t persona-frontend ./frontend
docker run --rm -p 8080:80 persona-frontend
```

The app expects a backend reachable at the Docker service name `backend` on port `5000`. For the complete local stack, use the root project's `docker-compose.yml` from the original project layout:

```bash
docker compose up --build
```

Open <http://localhost:8080>.

## Run for development

```bash
npm ci
npm run dev
```

Vite forwards `/api` requests to `http://localhost:5000`.

## Build

```bash
npm ci
npm run build
```

The production build is served by the included `Dockerfile` and `nginx.conf`.

## Publish to Docker Hub

Create the `e-commfrontend` repository on Docker Hub, then build and push from the project root:

```bash
docker login -u <your-dockerhub-username>
docker build -t <your-dockerhub-username>/e-commfrontend:v1 ./frontend
docker push <your-dockerhub-username>/e-commfrontend:v1
```
