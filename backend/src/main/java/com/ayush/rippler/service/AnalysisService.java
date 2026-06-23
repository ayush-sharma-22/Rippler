package com.ayush.rippler.service;

import com.ayush.rippler.detector.ProjectTypeDetector;
import com.ayush.rippler.ingestion.GithubIngestor;
import com.ayush.rippler.ingestion.LocalFolderIngestor;
import com.ayush.rippler.ingestion.ZipIngestor;
import com.ayush.rippler.model.AnalysisResult;
import com.ayush.rippler.model.DependencyGraph;
import com.ayush.rippler.model.NodeType;
import com.ayush.rippler.parser.SourceParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final LocalFolderIngestor localFolderIngestor;
    private final ZipIngestor zipIngestor;
    private final GithubIngestor githubIngestor;
    private final ProjectTypeDetector projectTypeDetector;
    private final SourceParser sourceParser;

    public AnalysisResult analyzeFolder(String folderPath) throws IOException {
        Path path = localFolderIngestor.ingest(folderPath);
        return performAnalysis(path, path.getFileName().toString(), false);
    }

    public AnalysisResult analyzeZip(InputStream zipStream, String originalFilename) throws IOException {
        Path tempPath = null;
        try {
            tempPath = zipIngestor.ingest(zipStream);
            String projectName = originalFilename != null ? originalFilename.replaceAll("\\.[^.]+$", "") : "uploaded-zip";
            return performAnalysis(tempPath, projectName, true);
        } finally {
            if (tempPath != null) {
                cleanupTempDir(tempPath);
            }
        }
    }

    public AnalysisResult analyzeGithub(String githubUrl) throws IOException {
        Path tempPath = null;
        try {
            tempPath = githubIngestor.ingest(githubUrl);
            String projectName = extractGithubProjectName(githubUrl);
            return performAnalysis(tempPath, projectName, true);
        } finally {
            if (tempPath != null) {
                cleanupTempDir(tempPath);
            }
        }
    }

    private AnalysisResult performAnalysis(Path rootPath, String projectName, boolean isTempDir) {
        log.info("Starting analysis for project: {} at path: {}", projectName, rootPath);
        
        AnalysisResult result = new AnalysisResult();
        result.setId(UUID.randomUUID().toString());
        result.setProjectName(projectName);
        
        DependencyGraph graph = new DependencyGraph();
        
        try {
            String type = projectTypeDetector.detect(rootPath);
            result.setProjectType(type);
            
            graph = sourceParser.parse(rootPath);
            
            result.setGraph(graph);
            result.setStatus("SUCCESS");
            
            log.info("Analysis completed successfully for project: {}", projectName);
        } catch (Exception e) {
            log.error("Error analyzing project: {}", projectName, e);
            result.setStatus("FAILED");
            result.setErrorMessage(e.getMessage());
        }
        
        return result;
    }

    private String extractGithubProjectName(String url) {
        String[] parts = url.split("/");
        String name = parts[parts.length - 1];
        if (name.endsWith(".git")) {
            name = name.substring(0, name.length() - 4);
        }
        return name;
    }

    private void cleanupTempDir(Path tempPath) {
        try {
            FileSystemUtils.deleteRecursively(tempPath);
            log.debug("Cleaned up temporary directory: {}", tempPath);
        } catch (IOException e) {
            log.warn("Failed to clean up temporary directory: {}", tempPath, e);
        }
    }
}
