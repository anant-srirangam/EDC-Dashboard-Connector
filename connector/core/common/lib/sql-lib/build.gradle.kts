plugins {
    `java-library`
    `maven-publish`
}

dependencies {
    implementation(libs.edc.core.spi)
    implementation(libs.edc.transaction.spi)
    implementation(libs.edc.transactions.datasource.spi)
    implementation(project(":core:common:lib:util-lib"))
}


