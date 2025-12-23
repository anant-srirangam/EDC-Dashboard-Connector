package org.eclipse.edc.extensions.control.plane.operators;

import org.eclipse.edc.runtime.metamodel.annotation.Extension;
import org.eclipse.edc.runtime.metamodel.annotation.Inject;
import org.eclipse.edc.spi.monitor.Monitor;
import org.eclipse.edc.spi.system.ServiceExtension;
import org.eclipse.edc.spi.system.ServiceExtensionContext;
import org.eclipse.edc.web.spi.WebService;
import org.eclipse.edc.web.spi.configuration.ApiContext;

@Extension(OperatorsExtension.NAME)
public class OperatorsExtension implements ServiceExtension {
    public static final String NAME = "Operators Extension";
    @Inject
    WebService webService;

    @Inject
    private Monitor monitor;

    @Override
    public void initialize(ServiceExtensionContext context) {
        webService.registerResource(ApiContext.MANAGEMENT, new OperatorsApiController());
        monitor.info(NAME + " initialized");
    }
}
