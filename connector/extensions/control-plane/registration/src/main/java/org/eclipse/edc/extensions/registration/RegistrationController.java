package org.eclipse.edc.extensions.registration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import okhttp3.Request;
import okhttp3.RequestBody;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.Map;

import okhttp3.HttpUrl;
import org.eclipse.edc.http.spi.EdcHttpClient;
import org.eclipse.edc.runtime.metamodel.annotation.Setting;
import org.eclipse.edc.spi.EdcException;
import org.eclipse.edc.spi.monitor.Monitor;
import org.eclipse.edc.spi.security.Vault;

@Path("/registration")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RegistrationController {
    public static final String NAME = "RegistrationController";
    public static final String CREDENTIAL_PATH = "v1alpha/participants/%s/credentials";
    public static final String API_KEY_ALIAS = "edc.participant.api.key.alias";


    private final String participantId;
    private final String identityHubPath;
    private final Vault vault;
    private final EdcHttpClient httpClient;
    private final Monitor monitor;
    private final ObjectMapper objectMapper;
    private final String apiKeyAlias;
    private final String apiKey;


    public RegistrationController(String participantId, String identityHubPath, Vault vault, EdcHttpClient httpClient, Monitor monitor, ObjectMapper objectMapper) {
        this.participantId = participantId;
        this.identityHubPath = identityHubPath;
        this.vault = vault;
        this.httpClient = httpClient;
        this.monitor = monitor;
        this.objectMapper = objectMapper;

        apiKeyAlias = vault.resolveSecret(API_KEY_ALIAS);
        apiKey = vault.resolveSecret(apiKeyAlias);

        monitor.info(identityHubPath);
    }

    @GET
    @Path("/status")
    public Response getRegistrationStatus() {
        return Response.ok(Map.of("registered", true, "participant", participantId)).build();
    }
    
    @POST
    @Path("/register")
    public Response registerUser(Map<String, String> request) {
        String verifiableCredentials = request.get("verifiableCredentials");

        if (verifiableCredentials == null) {
            return Response.status(400)
                    .entity(Map.of("error", "verifiableCredentials are required"))
                    .build();
        }

        var uri = getIdentityHubUrl();
        monitor.info("Registering credentials to %s".formatted(uri));
        var req = new Request.Builder()
                .url(uri)
                .header("x-api-key", apiKey)
                .post(RequestBody.create(verifiableCredentials, okhttp3.MediaType.get("application/json")))
                .build();

        try (var response = httpClient.execute(req)) {
            String body = response.body() != null ? response.body().string() : null;

            if (response.isSuccessful()) {
                monitor.debug("Successfully registered credentials");
                return Response.ok(Map.of("success", true, "message", "Successfully registered credentials")).build();
            } else {
                monitor.withPrefix(NAME).severe("Failed to register credentials %s".formatted(body));
                return Response.status(response.code())
                        .entity(Map.of("error", response.body() == null ? "Unknown error" : body))
                        .build();
            }
        } catch (IOException e) {
            monitor.withPrefix(NAME).severe("Failed to register credentials", e);
            return Response.status(400)
                    .entity(Map.of("error", e.getLocalizedMessage()))
                    .build();
        }
    }

    private HttpUrl getIdentityHubUrl() {
        var builder = HttpUrl.parse(identityHubPath).newBuilder();
        buildPathSegments(String.format(CREDENTIAL_PATH, (Object) Base64.getEncoder().encodeToString(participantId.getBytes(StandardCharsets.UTF_8))),
                builder);

        return builder.build();
    }

    private void buildPathSegments(String path, HttpUrl.Builder builder) {
        Arrays.stream(path.replaceAll("^/+", "").replaceAll("/+$", "").split("/"))
                .filter(segment -> !segment.isBlank())
                .forEach(builder::addPathSegment);
    }
}