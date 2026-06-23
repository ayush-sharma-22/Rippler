package com.ayush.rippler.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DependencyGraph {
    @Builder.Default
    private List<ProjectNode> nodes = new ArrayList<>();
    @Builder.Default
    private List<DependencyEdge> edges = new ArrayList<>();
}
