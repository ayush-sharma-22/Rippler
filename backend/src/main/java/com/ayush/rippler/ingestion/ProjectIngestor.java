package com.ayush.rippler.ingestion;

import java.io.IOException;
import java.nio.file.Path;

public interface ProjectIngestor<T> {
    Path ingest(T source) throws IOException;
}
