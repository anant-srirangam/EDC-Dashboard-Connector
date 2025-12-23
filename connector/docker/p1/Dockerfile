FROM gradle:8.8-jdk21 AS builder
COPY . /workspace
WORKDIR /workspace
RUN gradle shadowJar

FROM gradle:8.8-jdk21

# Copy the built workspace
COPY --from=builder /workspace /app
WORKDIR /app
RUN mkdir -p /data /home/edc
VOLUME ["/data"]

# Install dependencies
RUN apt-get update && apt-get install -y curl jq unzip postgresql-client

# Install Vault CLI/Agent
RUN curl -fsSL https://releases.hashicorp.com/vault/1.16.0/vault_1.16.0_linux_amd64.zip -o /tmp/vault.zip \
 && unzip /tmp/vault.zip -d /usr/local/bin \
 && rm /tmp/vault.zip

# Environment variables for database
ENV EDC_DB_HOST=postgres-edc
ENV EDC_DB_USER=edc_user
ENV EDC_DB_PASSWORD=edc_password
ENV EDC_DB_NAME=edc_db

# Environment variables for Vault (will be injected by setup script / docker-compose)
ENV VAULT_ADDR=http://vault:8200
ENV VAULT_ROLE_ID=
ENV VAULT_SECRET_ID=

COPY init.sh /app/init.sh
RUN chmod +x /app/init.sh

COPY docker/p1/connector-config.json /app/connector-config.json

HEALTHCHECK --interval=5s --timeout=5s --retries=10 CMD curl --fail http://localhost:8181/api/check/health

# Run Vault Agent + connector
ENTRYPOINT ["/app/init.sh"]
