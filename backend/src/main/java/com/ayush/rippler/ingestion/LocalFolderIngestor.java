package com.ayush.rippler.ingestion;

import org.springframework.stereotype.Component;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;

@Component
public class LocalFolderIngestor {

    public Path ingest(String folderPath) throws IOException {
        Path path = Paths.get(folderPath);
        if (!Files.exists(path)) {
            throw new IOException("Folder not found: " + folderPath);
        }
        if (!Files.isDirectory(path)) {
            throw new IOException("Path is not a directory: " + folderPath);
        }
        return path;
    }
}
