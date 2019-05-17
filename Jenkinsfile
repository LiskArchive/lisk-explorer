@Library('lisk-jenkins') _

pipeline {
	agent { node { label 'lisk-explorer' } }
	environment {
		LISK_CORE_VERSION = '1.3.1'
		EXPLORER_PORT = "604$EXECUTOR_NUMBER"
		LISK_HOST = 'localhost'
		REDIS_DB = "$EXECUTOR_NUMBER"
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
				dir('lisk') {
					checkout([$class: 'GitSCM',
						  branches: [[name: "v${env.LISK_CORE_VERSION}" ]],
						  userRemoteConfigs: [[url: 'https://github.com/LiskHQ/lisk']]])
				}

				ansiColor('xterm') {
					sh '''#!/bin/bash -xe
					rm -rf $WORKSPACE/$BRANCH_NAME/
					cp -rf $WORKSPACE/lisk/docker/ $WORKSPACE/$BRANCH_NAME/
					cp $WORKSPACE/test/data/test_blockchain-explorer.db.gz $WORKSPACE/$BRANCH_NAME/dev_blockchain.db.gz
					cd $WORKSPACE/$BRANCH_NAME
					cp .env.development .env

					sed -i -r -e '/ports:/,+2d' docker-compose.yml
					# random port assignment
					cat <<EOF >docker-compose.override.yml
version: "2"
services:

  lisk:
    ports:
      - \\${ENV_LISK_HTTP_PORT}
      - \\${ENV_LISK_WS_PORT}
EOF

					ENV_LISK_VERSION="$LISK_CORE_VERSION" make coldstart
					'''
					// show some build-related info
					sh '''
					cd $WORKSPACE/$BRANCH_NAME
					sha1sum dev_blockchain.db.gz
					docker-compose config
					docker-compose ps
					'''
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
					sleep 20
					'''
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
