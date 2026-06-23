package com.ayush.rippler.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResult {
    private String id;
    private String projectName;
    private String projectType; // MICROSERVICE or MONOLITH
    private Map<String, NodeType> projectTypes;
    private String status;
    private String errorMessage;
    private DependencyGraph graph;
    private AnalysisStats stats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalysisStats {
        private int serviceCount;
        private int classCount;
        private int packageCount;
        private int dependencyCount;
    }
}
