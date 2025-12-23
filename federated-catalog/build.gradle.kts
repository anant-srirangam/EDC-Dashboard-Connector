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
    implementation(project(":federated-catalog-core"))
    implementation(project(":dcp-impl"))

    implementation(libs.bundles.sql.edc)

    runtimeOnly(libs.edc.api.secrets)
    runtimeOnly(libs.bundles.connector)
    runtimeOnly(libs.edc.api.management)
    runtimeOnly(libs.edc.api.management.config)
    runtimeOnly(libs.edc.controlplane.core) //default store impls, etc.
    runtimeOnly(libs.edc.controlplane.services) // aggregate services
    runtimeOnly(libs.edc.core.edrstore)
    runtimeOnly(libs.edc.dsp) // protocol webhook
    runtimeOnly(libs.bundles.dcp) // DCP protocol impl
    runtimeOnly(libs.edc.api.dsp.config) // json-ld expansion
    runtimeOnly(libs.edc.vault.hashicorp)
    runtimeOnly(libs.edc.sts.remote.client)
}

application {
    mainClass.set("org.eclipse.edc.boot.system.runtime.BaseRuntime")
}

tasks.withType<com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar> {
    mergeServiceFiles()
    archiveFileName.set("federated-catalog.jar")
}