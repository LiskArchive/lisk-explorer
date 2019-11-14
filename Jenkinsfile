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
	agent { node { label 'lisk-service' } }
	stages {


		stage('Build docker image') {
			steps {
				sh '''
				docker build --tag=lisk/explorer ./
				'''
			}
		}
		// stage ('Build dependencies') {
		// 	steps {
		// 		sh 'npm ci'
		// 		dir('./components/gateway') { sh 'npm ci' }
		// 		dir('./components/core') { sh 'npm ci' }
		// 		dir('./components/legacy') { sh 'npm ci' }
		// 	}
		// }
		stage ('Run ESLint') {
			steps {
				sh 'npm run eslint:legacy'
				sh 'npm run eslint:gateway'
				sh 'npm run eslint:core'
			}
		}
		// stage('Run unit tests') {
		// 	steps {
		// 		sh '''
		// 		REDIS_INSTANCE_ID=$(docker run -P -d redis:5-alpine)
		// 		REDIS_PORT=$(docker inspect --format='{{(index (index .NetworkSettings.Ports "6379/tcp") 0).HostPort}}' $REDIS_INSTANCE_ID)
		// 		echo $REDIS_INSTANCE_ID > REDIS_INSTANCE_ID.txt
		// 		npm run test:unit
		// 		'''
		// 	}
		// 	post {
		// 		cleanup {
		// 			sh 'docker rm -f $(cat REDIS_INSTANCE_ID.txt)'
		// 		}
		// 	}
		// }
		stage('Run custom blockchain tests') {
			steps {
				// Run Lisk Core & Lisk Service
				sh 'cd utils/core-jenkins && make coldstart'

				// Test Legacy API
				// FIXME: Due to a problem with gateway readyness reporting
				//        the tests can be performed only in that order. 
				//        https://github.com/LiskHQ/lisk-service/issues/178
				// FIXME: These tests can be run in parallel in the future.
				waitForHttp('http://localhost:9901/api/getLastBlocks');
				sleep(10)
				sh 'npm run test:integration:legacy:local'

				// Test Version 1 HTTP API
				waitForHttp('http://localhost:9901/api/v1/blocks');
				sh 'npm run test:integration:v1:local'

				// Test WebSocket JSON-RPC API
				waitForHttp('http://localhost:9901/api/v1/blocks');
				sh 'npm run test:integration:v1:socketRpc:local'
			}
			post {
				failure {
					sh 'cd utils/core-jenkins && make logs'
				}
				cleanup {
					sh 'cd utils/core-jenkins && make mrproper'
				}
			}
		}
	}
}
// vim: filetype=groovy
