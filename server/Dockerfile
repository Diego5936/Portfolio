FROM node:22-bookworm-slim

WORKDIR /app

# Python for diffusion worker + libgomp1 for PyTorch CPU
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    libgomp1 \
  && rm -rf /var/lib/apt/lists/*

# Node dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Python dependencies 
COPY requirements.txt ./
RUN python3 -m pip install --no-cache-dir --break-system-packages -r requirements.txt

# Application source
COPY tsconfig.json ./
COPY src ./src

# Runtime output + Hugging Face model cache
RUN mkdir -p public/generated/diffusion .cache/diffusion-model

ENV NODE_ENV=production
ENV PYTHON_PATH=python3
ENV PORT=3001

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
