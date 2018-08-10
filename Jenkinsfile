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
		stage ('Start Lisk Service') {
			steps {
				dir("$WORKSPACE/$BRANCH_NAME/") {
					ansiColor('xterm') {
						sh '''
						rsync -axl --delete ~/lisk-docker/examples/development/ ./
						cp ~/blockchain_explorer.db.gz ./blockchain.db.gz
						make coldstart
						'''
						// show some build-related info
						sh '''
						sha1sum ./blockchain.db.gz
						docker-compose config
						docker-compose ps
						'''
					}
				}
			}
		}
		stage ('Run E2E tests') {
			steps {
				wrap([$class: 'Xvfb']) {
					sh '''
					npm run e2e -- --params.baseURL http://localhost:$LISK_EXPLORER_PORT
					'''
				}
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

			junit 'xunit-report.xml'

			archiveArtifacts artifacts: 'logs/*.log', allowEmptyArchive: true
			dir('logs') {
				deleteDir()
			}
		}
	}
}
