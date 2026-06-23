package com.ayush.rippler.detector;

import org.springframework.stereotype.Component;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

@Component
public class ProjectTypeDetector {

    public String detect(Path projectPath) {
        if (projectPath == null || !Files.exists(projectPath)) {
            return "MONOLITH";
        }
        try {
            if (scanForMicroserviceIndicators(projectPath)) {
                return "MICROSERVICE";
            }
        } catch (Exception ignored) {}
        return "MONOLITH";
    }

    private boolean scanForMicroserviceIndicators(Path rootPath) throws IOException {
        // 1. Check pom.xml / build.gradle for cloud dependencies
        try (Stream<Path> walk = Files.walk(rootPath)) {
            if (walk.filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().equals("pom.xml") || p.getFileName().toString().equals("build.gradle"))
                    .anyMatch(this::containsMicroserviceDependencies)) return true;
        }
        // 2. Check Java files for Feign/Eureka annotations
        try (Stream<Path> walk = Files.walk(rootPath)) {
            if (walk.filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(".java"))
                    .anyMatch(this::containsMicroserviceAnnotations)) return true;
        }
        // 3. Check config files for Eureka config
        try (Stream<Path> walk = Files.walk(rootPath)) {
            if (walk.filter(Files::isRegularFile)
                    .filter(p -> {
                        String n = p.getFileName().toString();
                        return n.endsWith(".yml") || n.endsWith(".yaml") || n.endsWith(".properties");
                    })
                    .anyMatch(this::containsMicroserviceConfigs)) return true;
        }
        return false;
    }

    private boolean containsMicroserviceDependencies(Path f) {
        try {
            String c = Files.readString(f);
            return c.contains("spring-cloud-starter-openfeign") ||
                   c.contains("spring-cloud-starter-netflix-eureka-client") ||
                   c.contains("spring-cloud-dependencies") ||
                   c.contains("spring-cloud-starter-config");
        } catch (IOException e) { return false; }
    }

    private boolean containsMicroserviceAnnotations(Path f) {
        try {
            String c = Files.readString(f);
            return c.contains("@FeignClient") ||
                   c.contains("@EnableEurekaClient") ||
                   c.contains("@EnableDiscoveryClient");
        } catch (IOException e) { return false; }
    }

    private boolean containsMicroserviceConfigs(Path f) {
        try {
            String c = Files.readString(f);
            return c.contains("eureka.client") ||
                   c.contains("eureka:") ||
                   c.contains("spring.cloud.config");
        } catch (IOException e) { return false; }
    }
}
