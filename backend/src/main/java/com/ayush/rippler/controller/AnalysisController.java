package com.ayush.rippler.controller;

import com.ayush.rippler.model.AnalysisResult;
import com.ayush.rippler.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/analyze")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/github")
    public ResponseEntity<AnalysisResult> analyzeGithub(@RequestBody Map<String, String> request) {
        try {
            String url = request.get("url");
            if (url == null || url.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            AnalysisResult result = analysisService.analyzeGithub(url);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/zip")
    public ResponseEntity<AnalysisResult> analyzeZip(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            AnalysisResult result = analysisService.analyzeZip(file.getInputStream(), file.getOriginalFilename());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/folder")
    public ResponseEntity<AnalysisResult> analyzeFolder(@RequestBody Map<String, String> request) {
        try {
            String path = request.get("path");
            if (path == null || path.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            AnalysisResult result = analysisService.analyzeFolder(path);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
