package org.eclipse.edc.extensions.identityhub;

import com.nimbusds.jose.jwk.JWK;
import org.eclipse.edc.iam.did.spi.document.Service;
import org.eclipse.edc.identityhub.spi.participantcontext.ParticipantContextService;
import org.eclipse.edc.identityhub.spi.participantcontext.model.KeyDescriptor;
import org.eclipse.edc.identityhub.spi.participantcontext.model.ParticipantManifest;
import org.eclipse.edc.runtime.metamodel.annotation.Inject;
import org.eclipse.edc.runtime.metamodel.annotation.Setting;
import org.eclipse.edc.spi.EdcException;
import org.eclipse.edc.spi.monitor.Monitor;
import org.eclipse.edc.spi.security.Vault;
import org.eclipse.edc.spi.system.ServiceExtension;
import org.eclipse.edc.spi.system.ServiceExtensionContext;

import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.Base64;
import java.util.Map;
import java.util.Objects;

public class ParticipantContextExtension implements ServiceExtension {
    public static final String NAME = "ParticipantContext Seed Extension";
    public static final String PRIVATE_KEY_ALIAS = "participant-private-key-alias";
    public static final String PRIVATE_KEY_ALIAS_CONFIG = "edc.participant.private.key.alias";
    public static final String PUBLIC_KEY_ALIAS_CONFIG = "edc.participant.public.key.alias";
    public static final String EDC_PARTICIPANT_ID_CONFIG = "edc.participant.id";
    public static final String PARTICIPANT_CONTEXT_API_KEY_ALIAS = "edc.participant.api.key.alias";
    public static final String PARTICIPANT_DID = "edc.participant.did";
    public static final String URL_ENCODED_COLON_SEPARATOR = URLEncoder.encode(":", StandardCharsets.UTF_8);

    private String participantId;
    private String did;
    private String publicKeyAlias;
    private Monitor monitor;

    @Setting(key = "web.http.did.port.host", required = true)
    private int didPort;

    @Setting(key = "web.http.credentials.port.host", required = true)
    private int credentialsPort;

    @Setting(key = "edc.hostname", required = true)
    private String hostname;

    @Setting(key = "web.http.credentials.path", required = true)
    private String credentialsPath;

    @Setting(key = "edc.connector.protocol.port.host", required = true)
    private int connectorProtocolPort;

    @Setting(key = "edc.connector.protocol.path.host", required = true)
    private String connectorProtocolPath;

    @Inject
    private ParticipantContextService participantContextService;
    @Inject
    private Vault vault;

    @Override
    public String name() {
        return NAME;
    }

    @Override
    public void initialize(ServiceExtensionContext context) {
        participantId = context.getParticipantId();
        did = String.format("did:web:%s%s%d", hostname, URL_ENCODED_COLON_SEPARATOR, didPort);
        publicKeyAlias = String.format("%s#key-1", did);
        monitor = context.getMonitor();

        // Store configs in vault
        vault.storeSecret(EDC_PARTICIPANT_ID_CONFIG, did)
                .onSuccess(s -> monitor.debug("Stored participant ID in vault"))
                .onFailure(f -> monitor.severe("Error storing participant ID in vault: %s".formatted(f.getFailureDetail())));
        vault.storeSecret(PRIVATE_KEY_ALIAS_CONFIG, PRIVATE_KEY_ALIAS)
                .onSuccess(s -> monitor.debug("Stored private key alias in vault"))
                .onFailure(f -> monitor.severe("Error storing private key alias in vault: %s".formatted(f.getFailureDetail())));
        vault.storeSecret(PUBLIC_KEY_ALIAS_CONFIG, publicKeyAlias)
                .onSuccess(s -> monitor.debug("Stored public key ID in vault"))
                .onFailure(f -> monitor.severe("Error storing public key ID in vault: %s".formatted(f.getFailureDetail())));
    }

    @Override
    public void start() {
        // register control plane participant context
        if (participantContextService.getParticipantContext(did).succeeded()) { // already exists
            monitor.debug("Control Plane participant already exists with ID '%s', will not re-create".formatted(did));
        } else {
            participantContextService.createParticipantContext(ParticipantManifest.Builder.newInstance()
                            .participantId(did)
                            .did(did)
                            .key(KeyDescriptor.Builder.newInstance()
                                    .keyGeneratorParams(Map.of("algorithm", "EdDSA", "curve", "Ed25519"))
                                    .keyId(publicKeyAlias)
                                    .privateKeyAlias(PRIVATE_KEY_ALIAS)
                                    .build())
                            .serviceEndpoint(new Service("credential-service", "CredentialService",
                                    "http://%s:%d%s/v1/participants/%s".formatted(hostname, credentialsPort, credentialsPath,
                                            Base64.getEncoder().encodeToString(did.getBytes(StandardCharsets.UTF_8)))))
                            .serviceEndpoint(new Service("ProtocolEndpoint", "DSP",
                                    "http://%s:%d%s".formatted(hostname, connectorProtocolPort, connectorProtocolPath)))
                            .active(true)
                            .build())
                    .onSuccess(response -> {
                        monitor.info("Created context for %s.".formatted(did));
                        participantContextService.getParticipantContext(did)
                                .onSuccess(pc -> {
                                    pc.activate();
                                    vault.storeSecret(PARTICIPANT_CONTEXT_API_KEY_ALIAS, pc.getApiTokenAlias())
                                            .onSuccess(s -> monitor.debug("Stored api token alias in vault"))
                                            .onFailure(f -> monitor.severe("Error storing api token alias in vault: %s".formatted(f.getFailureDetail())));

                                    try {
                                        JWK privateKey = JWK.parse(Objects.requireNonNull(vault.resolveSecret(PRIVATE_KEY_ALIAS)));
                                        var publicKeySerialized = privateKey.toPublicJWK().toJSONString();
                                        vault.storeSecret(publicKeyAlias, publicKeySerialized)
                                                .onSuccess(s -> monitor.debug("Stored participant public key in vault"))
                                                .onFailure(f -> monitor.severe("Error storing participant public key in vault: %s".formatted(f.getFailureDetail())));
                                    } catch (ParseException e) {
                                        throw new RuntimeException(e);
                                    }
                                })
                                .onFailure(f -> monitor.severe("Error context not found for '%s': %s".formatted(participantId, f.getFailureDetail())));
                    })
                    .orElseThrow(f -> new EdcException("Error creating control plane participant context: " + f.getFailureDetail()));
        }
    }
}
