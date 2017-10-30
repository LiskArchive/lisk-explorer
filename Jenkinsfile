def fail(reason) {
  sh '''
  ps aux > ps_log.log
  netstat -tunap > netstat_log.log
  '''

  def pr_branch = ''
  if (env.CHANGE_BRANCH != null) {
    pr_branch = " (${env.CHANGE_BRANCH})"
  }
  slackSend color: 'danger', message: "Build #${env.BUILD_NUMBER} of <${env.BUILD_URL}|${env.JOB_NAME}>${pr_branch} failed (<${env.BUILD_URL}/console|console>, <${env.BUILD_URL}/changes|changes>)\nCause: ${reason}", channel: '#lisk-explorer-jenkins'
  currentBuild.result = 'FAILURE'
  error("${reason}")
}

node('lisk-explorer-01'){
  try {
    stage ('Prepare Workspace') {
      deleteDir()
      checkout scm
    }

    stage ('Build Dependencies') {
      try {
        sh '''
        # Install Deps
        npm install
        ./node_modules/protractor/bin/webdriver-manager update
        '''
      } catch (err) {
        echo "Error: ${err}"
        fail('Stopping build, installation failed')
      }
    }

    stage ('Run Eslint') {
      try {
        sh '''
        # Run Eslint
        npm run eslint
        '''
      } catch (err) {
        echo "Error: ${err}"
        fail('Stopping build, webpack failed')
      }
    }

    stage ('Run Webpack Build') {
      try {
        sh '''
        # Build Bundles
        npm run build
        '''
      } catch (err) {
        echo "Error: ${err}"
        fail('Stopping build, webpack failed')
      }
    }

    stage ('Start Redis') {
      try {
        sh '''
        N=${EXECUTOR_NUMBER:-0}
        ~/redis-server --port 700$N > redis$N.log &
        cp test/config.test ./config.js

        '''
      } catch (err) {
        echo "Error: ${err}"
        fail('Stopping build, webpack failed')
      }
    }

    stage ('Build Candles') {
      try {
        sh '''
        N=${EXECUTOR_NUMBER:-0}
        # Generate market data
        REDIS_PORT=700$N grunt candles:build
        '''
      } catch (err) {
        echo "Error: ${err}"
        fail('Stopping build, candles build failed')
      }
    }

    stage ('Start Lisk ') {
      try {

        sh '''
        # work around core bug: config.json gets overwritten; use backup
        cp test/config_lisk.json ~/lisk-test/config_stage.json
        cd ~/lisk-test
        # disable redis
        jq '.cacheEnabled = false' config_stage.json > config.json

        if [[ ! $(pgrep -f '.*lisk-test/app.js') ]]; then
          JENKINS_NODE_COOKIE=dontKillMe bash lisk.sh start
        fi

        '''
      } catch (err) {
        echo "Error: ${err}"
        fail('Stopping build, lisk-core failed')
      }
    }

    stage ('Start Explorer') {
      try {
      sh '''
      N=${EXECUTOR_NUMBER:-0}
      LISTEN_PORT=604$N REDIS_PORT=700$N node $(pwd)/app.js --redisPort 700$N &> ./explorer$N.log &
      sleep 20
      '''
      } catch (err) {
        echo "Error: ${err}"
        fail('Stopping build, Explorer failed to start')
      }
    }

    stage ('Run tests') {
      try {
        sh '''
        # Run Tests
        N=${EXECUTOR_NUMBER:-0}
        sed -i -r -e "s/6040/604$N/" test/node.js
        REDIS_PORT=700$N npm run test
        '''
      } catch (err) {
        echo "Error: ${err}"
        fail('Stopping build, tests failed')
      }
    }

    stage ('Run e2e tests') {
      try {
        sh '''
        N=${EXECUTOR_NUMBER:-0}

        # End to End test configuration
        export DISPLAY=:9$N
        Xvfb :9$N -ac -screen 0 1280x1024x24 &
        ./node_modules/protractor/bin/webdriver-manager start --seleniumPort 443$N &

        # Run E2E Tests
        npm run e2e-test -- --params.baseURL http://localhost:604$N
        '''
      } catch (err) {
        echo "Error: ${err}"
        fail('Stopping build, e2e tests failed')
      }
    }

    stage ('Set milestone and cleanup') {
      milestone 1
      currentBuild.result = 'SUCCESS'
    }

  } catch(err) {
    echo "Error: ${err}"
  } finally {
    sh '''
    N=${EXECUTOR_NUMBER:-0}
    pkill -f "Xvfb :9$N" -9 || true
    pkill -f "webpack.*808$N" -9 || true
    pkill -f "explorer$N.log" || true
    pkill -f "redis-server.*700$N" || true
    '''
    dir('node_modules') {
      deleteDir()
    }

    def pr_branch = ''
    if (env.CHANGE_BRANCH != null) {
      pr_branch = " (${env.CHANGE_BRANCH})"
    }
    if (currentBuild.result == 'SUCCESS') {
      /* delete all files on success */
      deleteDir()
      /* notify of success if previous build failed */
      previous_build = currentBuild.getPreviousBuild()
      if (previous_build != null && previous_build.result == 'FAILURE') {
        slackSend color: 'good',
                  message: "Recovery: build #${env.BUILD_NUMBER} of <${env.BUILD_URL}|${env.JOB_NAME}>${pr_branch} was successful.",
                  channel: '#lisk-explorer-jenkins'
      }
    }
  }
}
