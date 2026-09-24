pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Privado / Polygon ID Android SDK (Teammate C will confirm exact artifact)
        maven { url = uri("https://jitpack.io") }
    }
}

rootProject.name = "VcDegreeWallet"
include(":app")
