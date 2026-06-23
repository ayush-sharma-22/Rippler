package com.ayush.rippler.parser;

import com.ayush.rippler.model.DependencyGraph;
import java.io.IOException;
import java.nio.file.Path;

public interface CodebaseParser {
    DependencyGraph parse(Path projectPath) throws IOException;
}
