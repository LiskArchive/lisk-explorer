@Library('lisk-jenkins') _

def waitForHttp(url) {
	timeout(1) {
		waitUntil {
			script {
				def api_available = sh script: "cd docker/jenkins && make http_status", returnStatus: true
				return (api_available == 0)
			}
		}
	}
}

pipeline {
	agent { node { label 'lisk-explorer' } }
	stages {

		stage('Build docker image') {
			steps {
				sh '''
				docker build --tag=lisk/explorer ./
				'''
			}
		}
		stage('Start the application') {
			steps {
				sh 'cd docker/jenkins && make coldstart'
			}
			post {
				failure {
					sh 'cd docker/jenkins && make logs'
					sh 'cd docker/jenkins && make mrproper'
				}
			}
		}
		stage ('Run ESLint') {
			steps {
				sh 'cd docker/jenkins && make eslint'
			}
			post {
				failure {
					sh 'cd docker/jenkins && make logs'
					sh 'cd docker/jenkins && make mrproper'
				}
			}
		}
		stage('Run functional tests') {
			steps {
				// waitForHttp('http://localhost:6040/api/getLastBlocks')
				sleep(5)
				sh 'cd docker/jenkins && make test'
			}
			post {
				failure {
					sh 'cd docker/jenkins && make logs'
				}
				cleanup {
					sh 'cd docker/jenkins && make mrproper'
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
	// post {
	// 	success {
	// 		script {
	// 			if (currentBuild.result == null || currentBuild.result == 'SUCCESS') {
	// 				previous_build = currentBuild.getPreviousBuild()
	// 				if (previous_build != null && previous_build.result == 'FAILURE') {
	// 					build_info = getBuildInfo()
	// 					liskSlackSend('good', "Recovery: build ${build_info} was successful.")
	// 				}
	// 			}
	// 		}
	// 	}
	// 	failure {
	// 		script {
	// 			build_info = getBuildInfo()
	// 			liskSlackSend('danger', "Build ${build_info} failed (<${env.BUILD_URL}/console|console>, <${env.BUILD_URL}/changes|changes>)\n")
	// 		}
	// 	}
	// 	always {
	// 		dir("$WORKSPACE/$BRANCH_NAME/") {
	// 			ansiColor('xterm') {
	// 				sh 'docker-compose logs || true'
	// 				sh 'make mrproper'
	// 			}
	// 		}

	// 		junit 'xunit-report.xml'

	// 		archiveArtifacts artifacts: 'logs/*.log', allowEmptyArchive: true
	// 		dir('logs') {
	// 			deleteDir()
	// 		}
	// 	}
	// }
}
// vim: filetype=groovy
