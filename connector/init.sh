#!/usr/bin/env bash
set -euo pipefail

VAULT_ADDR=${VAULT_ADDR:-http://vault:8200}
POLICY_NAME="edc-policy"
MOUNT_PATH="edc-config"
CONFIG_PATH="/app/docker/$1/config.properties"

DB_HOST=${EDC_DB_HOST:-"postgres-edc"}
DB_NAME=${EDC_DB_NAME:-"edc_db"}
DB_USER=${EDC_DB_USER:-"edc_user"}
DB_PASS=${EDC_DB_PASSWORD:-"edc_password"}

echo "🔍 Checking Vault status..."
STATUS_JSON=$(vault status -address="$VAULT_ADDR" -format=json 2>/dev/null || true)

if ! echo "$STATUS_JSON" | jq empty >/dev/null 2>&1; then
  STATUS_JSON="{}"
fi

IS_INIT=$(echo "$STATUS_JSON" | jq -r '.initialized')
IS_SEALED=$(echo "$STATUS_JSON" | jq -r '.sealed')

# Ensure DB table exists
echo "🗄 Ensuring database table exists..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER $DB_NAME -c "
CREATE TABLE IF NOT EXISTS vault_credentials (
    id SERIAL PRIMARY KEY,
    root_token TEXT NOT NULL,
    unseal_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# ------------------------------
# VAULT NOT INITIALIZED (FIRST RUN)
# ------------------------------
if [ "$IS_INIT" != "true" ]; then
    echo "🚀 Vault not initialized — initializing..."

    INIT_JSON=$(vault operator init -address=$VAULT_ADDR -key-shares=1 -key-threshold=1 -format=json)
    UNSEAL_KEY=$(echo "$INIT_JSON" | jq -r '.unseal_keys_b64[0]')
    ROOT_TOKEN=$(echo "$INIT_JSON" | jq -r '.root_token')

    echo "🔓 Unsealing Vault..."
    vault operator unseal -address=$VAULT_ADDR "$UNSEAL_KEY"

    echo "📦 Storing keys in database..."
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER $DB_NAME -c \
      "INSERT INTO vault_credentials (root_token, unseal_key) VALUES ('$ROOT_TOKEN', '$UNSEAL_KEY');"

    export VAULT_TOKEN=$ROOT_TOKEN

else
    echo "✔ Vault already initialized — retrieving token from DB..."

    ROOT_TOKEN=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -t -A -c \
      "SELECT root_token FROM vault_credentials ORDER BY id DESC LIMIT 1" $DB_NAME)

    UNSEAL_KEY=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -t -A -c \
      "SELECT unseal_key FROM vault_credentials ORDER BY id DESC LIMIT 1" $DB_NAME)

    if [ -z "$ROOT_TOKEN" ]; then
        echo "❌ ERROR: Vault is initialized but no token stored in DB!"
        exit 1
    fi

    if [ "$IS_SEALED" = "true" ]; then
        echo "🔓 Vault is initialized but sealed"
        echo "🔓 Unsealing Vault with stored key..."
        vault operator unseal -address=$VAULT_ADDR "$UNSEAL_KEY"
    fi


    export VAULT_TOKEN=$ROOT_TOKEN
fi

# Login as root/admin
vault login -address=$VAULT_ADDR $VAULT_TOKEN

# Create policy if it doesn't exist
if ! vault policy list -address=$VAULT_ADDR | grep -q "$POLICY_NAME"; then
    echo "Creating policy $POLICY_NAME..."
    vault policy write -address=$VAULT_ADDR $POLICY_NAME - <<EOF
path "${MOUNT_PATH}/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "${MOUNT_PATH}/metadata/*" {
  capabilities = ["list"]
}
EOF
else
    echo "Policy $POLICY_NAME already exists."
fi

echo "🔑 Creating new EDC Vault token..."

# Step 1: Get full JSON response
TOKEN_JSON=$(vault token create \
    -address="$VAULT_ADDR" \
    -policy="$POLICY_NAME" \
    -ttl=1h \
    -renewable=true \
    -format=json)

# Step 3: Extract token
EDC_TOKEN=$(echo "$TOKEN_JSON" | jq -r '.auth.client_token')

# Export as environment variable
export EDC_VAULT_HASHICORP_TOKEN=$EDC_TOKEN

if ! vault secrets list -address=$VAULT_ADDR | grep -q "^$MOUNT_PATH/"; then
    echo "🔧 KV engine not found at $MOUNT_PATH — enabling KV v2..."
    vault secrets enable -address=$VAULT_ADDR -path=$MOUNT_PATH -version=2 kv
else
    echo "✔ KV engine already exists at $MOUNT_PATH"
fi

CONFIG_JSON="/app/connector-config.json"

# Read all keys from JSON and loop
for key in $(jq -r 'keys[]' "$CONFIG_JSON"); do
    value=$(jq -r --arg k "$key" '.[$k]' "$CONFIG_JSON")
    SECRET_PATH="$MOUNT_PATH/$key"
    echo "ℹ️ Creating Secret $key"
    vault kv put -address="$VAULT_ADDR" "$SECRET_PATH" content="$value" >/dev/null || { echo "Failed to create secret $key"; exit 1; }
done

echo "$VAULT_ADDR"

EDC_PARTICIPANT_ID=$(vault kv get -format=json -address="$VAULT_ADDR" -mount="$MOUNT_PATH" "edc.participant.id" | jq -r '.data.data.content')
echo "✔️ EDC Participant ID: $EDC_PARTICIPANT_ID"

EDC_PARTICIPANT_PUBLIC_KEY_ALIAS=$(vault kv get -format=json -address="$VAULT_ADDR" -mount="$MOUNT_PATH" "edc.participant.public.key.alias" | jq -r '.data.data.content')
echo "✔️ EDC public key acquired"

EDC_PARTICIPANT_PRIVATE_KEY_ALIAS=$(vault kv get -format=json -address="$VAULT_ADDR" -mount="$MOUNT_PATH" "edc.participant.private.key.alias" | jq -r '.data.data.content')
echo "✔️ EDC private key acquired"




# Start the connector
java -Dedc.fs.config="$CONFIG_PATH" \
     -Dorg.slf4j.simpleLogger.defaultLogLevel=trace \
     -Dedc.vault.hashicorp.token=$EDC_VAULT_HASHICORP_TOKEN \
     -Dedc.extension.log=true \
     -Dedc.participant.id=$EDC_PARTICIPANT_ID \
     -Dedc.iam.sts.oauth.client.secret.alias="$EDC_PARTICIPANT_ID-sts-client-secret" \
     -Dedc.iam.sts.oauth.client.id=$EDC_PARTICIPANT_ID \
     -Dedc.transfer.proxy.token.verifier.publickey.alias=$EDC_PARTICIPANT_PUBLIC_KEY_ALIAS \
     -Dedc.transfer.proxy.token.signer.privatekey.alias=$EDC_PARTICIPANT_PRIVATE_KEY_ALIAS \
     -Dedc.iam.issuer.id=$EDC_PARTICIPANT_ID \
     -Dweb.http.management.auth.dac.audience=$EDC_PARTICIPANT_ID \
     -jar build/libs/connector.jar \
     --log-level=debug
