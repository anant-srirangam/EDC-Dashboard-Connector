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
    implementation(libs.edc.ih.spi.credentials)
    implementation(libs.edc.ih.spi)
    implementation(libs.edc.ih.api.participants)
    implementation(libs.edc.bom.identityhub)
    implementation(libs.edc.bom.identityhub.sql)
    runtimeOnly(libs.edc.vault.hashicorp)

}

application {
    mainClass.set("org.eclipse.edc.boot.system.runtime.BaseRuntime")
}

tasks.shadowJar {
    mergeServiceFiles()
    archiveFileName.set("identity-hub.jar")
    duplicatesStrategy = DuplicatesStrategy.INCLUDE
}