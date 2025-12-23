plugins {
    `java-library`
}

dependencies {
    api(libs.edc.core.spi)
    api(libs.edc.web.spi)
    implementation(libs.edc.http)
    implementation(libs.apache.commons.lang)
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    compileOnly("org.projectlombok:lombok:1.18.32")
    annotationProcessor("org.projectlombok:lombok:1.18.32")
}