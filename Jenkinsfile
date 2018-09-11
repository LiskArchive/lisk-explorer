@Library('lisk-jenkins') _

pipeline {
	agent { node { label 'lisk-explorer' } }
	environment {
		LISK_SERVICE_VERSION = '0.1.0'
		LISK_EXPLORER_PORT = "604$EXECUTOR_NUMBER"
	}
	stages {
		stage ('Build dependencies') {
			steps {
				sh 'npm install'
			}
		}
		stage ('Run ESLint') {
			steps {
				sh 'npm run eslint'
			}
		}
		stage ('Build bundles') {
			steps {
				sh 'npm run build'
			}
		}
	}
	post {
		success {
			script {
				if (currentBuild.result == null || currentBuild.result == 'SUCCESS') {
					previous_build = currentBuild.getPreviousBuild()
					if (previous_build != null && previous_build.result == 'FAILURE') {
						build_info = getBuildInfo()
						liskSlackSend('good', "Recovery: build ${build_info} was successful.")
					}
				}
			}
		}
		failure {
			script {
				build_info = getBuildInfo()
				liskSlackSend('danger', "Build ${build_info} failed (<${env.BUILD_URL}/console|console>, <${env.BUILD_URL}/changes|changes>)\n")
			}
		}
		always {
			dir("$WORKSPACE/$BRANCH_NAME/") {
				ansiColor('xterm') {
					sh 'docker-compose logs || true'
					sh 'make mrproper'
				}
			}

			archiveArtifacts artifacts: 'logs/*.log', allowEmptyArchive: true
			dir('logs') {
				deleteDir()
			}
		}
	}
}
