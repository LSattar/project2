FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
RUN ls -lh /app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]