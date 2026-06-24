FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Make maven wrapper executable and build the project
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Hugging Face needs 7860, others use 8080. We'll use a variable or default to 8080)
EXPOSE 7860
ENTRYPOINT ["java","-jar","app.jar"]
