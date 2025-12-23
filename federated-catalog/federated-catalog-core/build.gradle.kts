plugins {
    `java-library`
}

dependencies {
    implementation(libs.edc.spi.identity.did)
    implementation(libs.edc.fc.spi.crawler)
    runtimeOnly(libs.edc.fc.core)
    // todo: use 2025 once it is used everywhere
    // runtimeOnly(libs.edc.fc.core2025)
    runtimeOnly(libs.edc.fc.core08)
    runtimeOnly(libs.edc.fc.api)

    compileOnly("org.projectlombok:lombok:1.18.32")
    annotationProcessor("org.projectlombok:lombok:1.18.32")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")

}