pipeline {
    agent { label 'Binod' }

    stages {
        stage("Code") {
            steps {
                echo "Cloning the repository"
                git url: "https://github.com/KrishnaMittal-az/ecell1.git", branch: "main"
                echo "Repo cloned successfully"
            }
        }

        stage("Build") {
            steps {
                echo "Now building the Docker image"
                sh "docker build -t ecell:v1 ."
                echo "Image build successful"
            }
        }

        stage("Image") {
            steps {
                echo "Pushing the image to DockerHub"
                withCredentials([usernamePassword(
                    credentialsId: "DockerHubCred",
                    usernameVariable: "dockerHubUser",
                    passwordVariable: "dockerHubPass"
                )]) {
                    sh "docker login -u $dockerHubUser -p $dockerHubPass"
                    sh "docker image tag ecell:v1 $dockerHubUser/ecell:v1"
                    sh "docker push $dockerHubUser/ecell:v1"
                }
            }
        }

        stage("Deploy") {
            steps {
                echo "Stopping any container using port 3000"
                sh "docker ps -q --filter 'publish=3000' | xargs -r docker stop"
                echo "Deploying the container"
                sh "docker run -d -p 3000:3005 ecell:v1"
            }
        }
    }
}
