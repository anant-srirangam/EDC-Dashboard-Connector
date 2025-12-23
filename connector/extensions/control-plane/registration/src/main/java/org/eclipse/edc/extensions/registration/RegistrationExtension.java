package org.eclipse.edc.extensions.registration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.edc.http.spi.EdcHttpClient;
import org.eclipse.edc.runtime.metamodel.annotation.Extension;
import org.eclipse.edc.runtime.metamodel.annotation.Inject;
import org.eclipse.edc.runtime.metamodel.annotation.Setting;
import org.eclipse.edc.spi.monitor.Monitor;
import org.eclipse.edc.spi.security.Vault;
import org.eclipse.edc.spi.system.ServiceExtension;
import org.eclipse.edc.spi.system.ServiceExtensionContext;
import org.eclipse.edc.web.spi.WebService;

@Extension(value = RegistrationExtension.NAME)
public class RegistrationExtension implements ServiceExtension {
    public static final String NAME = "Registration Integration";

    private String participantId;

    @Setting(key = "edc.identity.hub.path", required = true)
    private String identityHubPath;

    @Inject
    private WebService webService;

    @Inject
    private Monitor monitor;

    @Inject
    private Vault vault;

    @Inject
    private EdcHttpClient httpClient;

    @Override
    public String name() {
        return NAME;
    }

    @Override
    public void initialize(ServiceExtensionContext context) {
        participantId = context.getParticipantId();
        webService.registerResource("management",
                new RegistrationController(participantId, identityHubPath, vault, httpClient, monitor, new ObjectMapper()));
    }
}
