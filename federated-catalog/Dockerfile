FROM gradle:8.11-jdk17 AS builder
COPY . /workspace
WORKDIR /workspace
RUN gradle shadowJar

FROM gradle:8.11-jdk17
#RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*
COPY --from=builder /workspace /app
WORKDIR /app
RUN mkdir -p /data
VOLUME ["/data"]
ENV EDC_DB_HOST=postgres-edc
ENV EDC_DB_USER=edc_user
ENV EDC_DB_PASSWORD=edc_password
ENV EDC_DB_NAME=edc_db

RUN apt-get update && apt-get install -y curl jq unzip postgresql-client

# Install Vault CLI/Agent
RUN curl -fsSL https://releases.hashicorp.com/vault/1.16.0/vault_1.16.0_linux_amd64.zip -o /tmp/vault.zip \
 && unzip /tmp/vault.zip -d /usr/local/bin \
 && rm /tmp/vault.zip

COPY init.sh /app/init.sh
RUN chmod +x /app/init.sh

COPY connector-config.json /app/connector-config.json

HEALTHCHECK --interval=5s --timeout=5s --retries=10 CMD curl --fail http://localhost:8181/api/check/health

ENTRYPOINT ["/app/init.sh"]