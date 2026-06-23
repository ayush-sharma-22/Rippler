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
public class ProjectNode {
    private String id;
    private String label;
    private NodeType type;
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();
}
