@Library('lisk-jenkins') _

pipeline {
	agent { node { label 'lisk-explorer' } }
	stages {
		stage ('Build dependencies') {
			steps {
				nvm(getNodejsVersion()) {
					sh 'npm ci'
				}
			}
		}
		stage ('Run ESLint') {
			steps {
				nvm(getNodejsVersion()) {
					sh 'npm run eslint'
				}
			}
		}
		stage ('Build bundles') {
			steps {
				nvm(getNodejsVersion()) {
					sh 'npm run build'
				}
			}
		}
		// stage ('Run E2E tests') {
		// 	steps {
		// 		wrap([$class: 'Xvfb']) {
		// 			nvm(getNodejsVersion()) {
		// 				sh 'npm run test:e2e -- --params.baseURL http://localhost:$EXPLORER_PORT'
		// 			}
		// 		}
		// 	}
		// }
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
			// archiveArtifacts artifacts: 'logs/*.log', allowEmptyArchive: true
			dir('logs') {
				deleteDir()
			}
		}
	}
}
