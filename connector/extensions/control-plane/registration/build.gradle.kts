plugins {
    `java-library`
}

dependencies {
    api(libs.edc.core.spi)
    api(libs.edc.web.spi)
    implementation(libs.edc.spi.http)
    implementation(libs.jakarta.rsApi)
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    implementation("org.apache.httpcomponents:httpclient:4.5.14")
    compileOnly("org.projectlombok:lombok:1.18.32")
    annotationProcessor("org.projectlombok:lombok:1.18.32")
}