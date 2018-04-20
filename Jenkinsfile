pipeline {
	agent { node { label 'lisk-explorer' } } 
	environment { 
		LISK_VERSION = '1.0.0-alpha.3'
		//
		EXPLORER_PORT = "604$EXECUTOR_NUMBER"
		LISK_HOST = 'localhost'
		REDIS_DB = "$EXECUTOR_NUMBER"
		REDIS_HOST = 'localhost'
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
		stage ('Build candles') {
			steps {
				// marketwatcher needs to be enabled to builds candles
				sh '''
				cp ./test/known.test.json ./known.json
				redis-cli -n $REDIS_DB flushdb
				grunt candles:build
				'''
			}
		}
		stage ('Start Lisk') {
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
						// Explorer needs the topAccounts feature to be enabled
						sh '''
						docker-compose exec -T lisk sed -i -r -e 's/(\\s*"topAccounts":)\\s*false,/\\1 true,/' config.json
						docker-compose restart lisk
						'''
					}
				}
			}
		}
		stage ('Start Explorer') {
			steps {
				sh '''
				cd $WORKSPACE/$BRANCH_NAME
				LISK_PORT=$( docker-compose port lisk 4000 |cut -d ":" -f 2 )
				cd -
				LISK_PORT=$LISK_PORT node app.js -p $EXPLORER_PORT &>/dev/null &
				sleep 20
				'''
			}
		}
		stage ('Run tests') {
			steps {
				sh '''
				sed -i -r -e "s/6040/$EXPLORER_PORT/" test/node.js
				npm run test-xunit
				'''
			}
		}
	}
	post {
		always {
			junit 'xunit_report.xml', allowEmptyResults: true
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
