FROM gradle:8.8-jdk17 AS builder
COPY . /workspace
WORKDIR /workspace
RUN gradle shadowJar

FROM gradle:8.8-jdk17
#RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*
COPY --from=builder /workspace /app
WORKDIR /app
RUN mkdir -p /data
VOLUME ["/data"]
ENV EDC_DB_HOST=postgres-edc
ENV EDC_DB_USER=edc_user
ENV EDC_DB_PASSWORD=edc_password
ENV EDC_DB_NAME=edc_db

RUN chmod +x /app/init.sh
RUN apt-get update && apt-get install -y curl jq

#ENTRYPOINT ["/app/init.sh"]
CMD ["sh", "-c", "java -Dedc.fs.config=/app/config.properties -Dorg.slf4j.simpleLogger.defaultLogLevel=debug -jar build/libs/connector.jar"]