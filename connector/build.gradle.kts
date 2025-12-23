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
    implementation(project(":extensions:control-plane:registration"))
    implementation(project(":extensions:control-plane:operators"))
    implementation(project(":extensions:dcp-impl"))

    implementation(libs.edc.json.ld.lib)

    // Vault
    api(libs.edc.vault.hashicorp)
    api(libs.apache.commons.lang)

    // Identity Hub & Issuer
    implementation(libs.edc.api.secrets)
    implementation(libs.edc.bom.controlplane)
    implementation(libs.edc.bom.controlplane.sql)
}

application {
    mainClass.set("org.eclipse.edc.boot.system.runtime.BaseRuntime")
}

tasks.withType<com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar> {
    mergeServiceFiles()
    archiveFileName.set("connector.jar")
}