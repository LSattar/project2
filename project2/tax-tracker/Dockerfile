FROM openjdk:17-jdk-alpine
WORKDIR /app
RUN ls -R /app/...
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]