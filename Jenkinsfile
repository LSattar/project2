pipeline {
    agent any

    stages {
        stage ('AWS CLI') {
            agent {
                docker{
                    image 'aws-cli'
                    args "--entrypoint=''"
                }
            }
            steps {
                withCredentials([usernamePassword
                (credentialsId: 'GitHub', passwordVariable: 'AWS_SECRET_ACCESS_Key',
                 usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                    sh '''
                    echo "Listing AWS CLI"
                    echo aws --version
                    '''
    // some block
}
            }
        }
    }
}