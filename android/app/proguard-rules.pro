# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Basic React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Native Modules
-keep class com.swmansion.** { *; } # Reanimated
-keep class com.horcrux.** { *; }   # SVG
-keep class org.unimodules.** { *; } # Expo

# Google Services
-keep class com.google.android.gms.** { *; }
-keep class com.google.firebase.** { *; }

# Crash Reporting
-keep class io.sentry.** { *; }
-keep class com.microsoft.appcenter.** { *; }

# React Navigation
-keep class androidx.navigation.** { *; }

# Hermes (RN 0.60+)
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.hermes.instrumentation.
