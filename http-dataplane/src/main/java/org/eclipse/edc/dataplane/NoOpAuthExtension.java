package org.eclipse.edc.dataplane;

import org.eclipse.edc.api.auth.ApiAuthenticationRegistryImpl;
import org.eclipse.edc.api.auth.spi.registry.ApiAuthenticationRegistry;
import org.eclipse.edc.runtime.metamodel.annotation.Extension;
import org.eclipse.edc.runtime.metamodel.annotation.Provider;
import org.eclipse.edc.spi.system.ServiceExtension;

@Extension("No-Op Auth Registry")
public class NoOpAuthExtension implements ServiceExtension {

    @Provider(isDefault = true)
    public ApiAuthenticationRegistry noOpAuthRegistry() {
        return new ApiAuthenticationRegistryImpl();
    }
}
