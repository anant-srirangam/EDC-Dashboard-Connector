plugins {
    `java-library`
    id("application")
    alias(libs.plugins.shadow)
}

allprojects {
    repositories {
        mavenCentral()
        maven {
            url = uri("https://oss.sonatype.org/content/repositories/snapshots/")
        }
    }
}

dependencies {
//    implementation(libs.edc.runtime.core)
//    implementation(libs.edc.boot)
//    implementation(libs.edc.connector.core)
//    implementation(libs.edc.control.api.configuration)
//    implementation(libs.edc.control.plane.api.client)
//    implementation(libs.edc.configuration.filesystem)
//    implementation(libs.edc.token.core)
//    implementation(libs.edc.http)
//    implementation(libs.edc.web.spi)
//    implementation(libs.edc.data.plane.self.registration)
//    implementation(libs.edc.data.plane.signaling.api)
//    implementation(libs.edc.data.plane.core)
//    implementation(libs.edc.data.plane.selector.client)
//    implementation(libs.edc.data.plane.spi)
//    implementation(libs.edc.api.core)
//    implementation(libs.edc.data.plane.http)
//    implementation(libs.edc.data.plane.iam)
    implementation(libs.edc.bom.dataplane)
//    implementation(libs.edc.dataplane.v2)
    implementation(libs.edc.vault.hashicorp)
    implementation(libs.edc.bom.dataplane.sql)
}

application {
    mainClass.set("org.eclipse.edc.boot.system.runtime.BaseRuntime")
}

tasks.withType<com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar> {
    mergeServiceFiles()
    archiveFileName.set("http-dataplane.jar")
}