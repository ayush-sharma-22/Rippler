package com.ayush.rippler.ingestion;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Component
public class ZipIngestor {

    public Path ingest(MultipartFile zipFile) throws IOException {
        return ingest(zipFile.getInputStream());
    }

    public Path ingest(InputStream is) throws IOException {
        Path tempDir = Files.createTempDirectory("rippler-");
        try (ZipInputStream zis = new ZipInputStream(is)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                Path entryPath = tempDir.resolve(entry.getName()).normalize();
                if (!entryPath.startsWith(tempDir)) {
                    throw new IOException("Invalid ZIP entry (path traversal): " + entry.getName());
                }
                if (entry.isDirectory()) {
                    Files.createDirectories(entryPath);
                } else {
                    Files.createDirectories(entryPath.getParent());
                    Files.copy(zis, entryPath, StandardCopyOption.REPLACE_EXISTING);
                }
                zis.closeEntry();
            }
        }
        return tempDir;
    }

    public Path ingestFromPath(Path zipPath) throws IOException {
        Path tempDir = Files.createTempDirectory("rippler-");
        try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(zipPath))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                Path entryPath = tempDir.resolve(entry.getName()).normalize();
                if (!entryPath.startsWith(tempDir)) continue;
                if (entry.isDirectory()) {
                    Files.createDirectories(entryPath);
                } else {
                    Files.createDirectories(entryPath.getParent());
                    Files.copy(zis, entryPath, StandardCopyOption.REPLACE_EXISTING);
                }
                zis.closeEntry();
            }
        }
        return tempDir;
    }
}
