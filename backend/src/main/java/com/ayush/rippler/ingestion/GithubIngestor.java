package com.ayush.rippler.ingestion;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GithubIngestor implements ProjectIngestor<String> {

    private final ZipIngestor zipIngestor;
    private final HttpClient httpClient;

    public GithubIngestor(ZipIngestor zipIngestor) {
        this.zipIngestor = zipIngestor;
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();
    }

    @Override
    public Path ingest(String githubUrl) throws IOException {
        if (githubUrl == null || githubUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("GitHub URL cannot be empty");
        }

        String cleanUrl = githubUrl.trim()
                .replaceAll("\\.git$", "")
                .replaceAll("/+$", "");

        Pattern pattern = Pattern.compile("github\\.com/([^/]+)/([^/]+)");
        Matcher matcher = pattern.matcher(cleanUrl);

        if (!matcher.find()) {
            throw new IllegalArgumentException("Invalid GitHub URL format: " + githubUrl);
        }

        String owner = matcher.group(1);
        String repo = matcher.group(2);

        String branch = "main";
        if (cleanUrl.contains("/tree/")) {
            int treeIdx = cleanUrl.indexOf("/tree/");
            branch = cleanUrl.substring(treeIdx + 6);
            if (branch.contains("/")) {
                branch = branch.substring(0, branch.indexOf("/"));
            }
            int treeStartInRepo = repo.indexOf("/tree/");
            if (treeStartInRepo != -1) {
                repo = repo.substring(0, treeStartInRepo);
            }
        }

        try {
            return downloadAndExtract(owner, repo, branch);
        } catch (IOException e) {
            if (branch.equals("main")) {
                return downloadAndExtract(owner, repo, "master");
            }
            throw e;
        }
    }

    private Path downloadAndExtract(String owner, String repo, String branch) throws IOException {
        String zipUrl = String.format("https://github.com/%s/%s/archive/refs/heads/%s.zip", owner, repo, branch);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(zipUrl))
                .GET()
                .build();

        try {
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() != 200) {
                throw new IOException("Failed to download from GitHub: HTTP " + response.statusCode());
            }
            return zipIngestor.ingest(response.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Interrupted while downloading from GitHub", e);
        }
    }
}
