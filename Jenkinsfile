@Library('lisk-jenkins') _

def waitForHttp(url) {
	timeout(1) {
		waitUntil {
			script {
				def api_available = sh script: "curl --silent --fail ${url} >/dev/null", returnStatus: true
				return (api_available == 0)
			}
		}
	}
}

pipeline {
	agent { node { label 'lisk-explorer' } }
	environment {
		EXPLORER_PORT = "604$EXECUTOR_NUMBER"
		LISK_HOST = 'localhost'
		REDIS_DB = "0"
		REDIS_HOST = 'localhost'
	}
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
		stage ('Build candles') {
			steps {
				nvm(getNodejsVersion()) {
					// marketwatcher needs to be enabled to builds candles
					sh '''
					redis-cli -n $REDIS_DB flushdb
					grunt candles:build
					'''
				}
			}
		}
		stage ('Start Lisk') {
			steps {
				sh 'cd test/docker/core-explorer && make coldstart'
			}
			post {
				failure {
					sh 'cd test/docker/core-explorer && make logs'
					sh 'cd test/docker/core-explorer && make mrproper'
				}
			}
		}
		stage ('Start Explorer') {
			steps {
				nvm(getNodejsVersion()) {
					sh '''
					cd $WORKSPACE/$BRANCH_NAME
					LISK_PORT=$( docker-compose port lisk 4000 |cut -d ":" -f 2 )
					cd -
					LISK_PORT=$LISK_PORT node app.js -p $EXPLORER_PORT &>/dev/null &
					'''
					waitForHttp('http://localhost:$EXPLORER_PORT/api/getLastBlocks');
				}
			}
		}
		stage ('Run API tests') {
			steps {
				nvm(getNodejsVersion()) {
					sh '''
					sed -i -r -e "s/6040/$EXPLORER_PORT/" test/node.js
					npm run test
					'''
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
