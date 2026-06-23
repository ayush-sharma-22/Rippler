package com.ayush.rippler.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DependencyEdge {
    private String source;
    private String target;
    private EdgeType type;
    private String label;
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();
}
