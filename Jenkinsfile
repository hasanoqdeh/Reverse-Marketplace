// Reverse Marketplace — Jenkins Pipeline (Ubuntu / Docker)
//
// iOS build: delegates to Codemagic via REST API (no Mac required).
// Android build: runs locally inside a Docker container.
//
// ── Jenkins Credentials to configure (Manage Jenkins → Credentials → Global) ──
//
//   CODEMAGIC_API_TOKEN  — Secret text — from Codemagic → User Settings → Integrations → API
//   CODEMAGIC_APP_ID     — Secret text — from Codemagic app URL:
//                          https://codemagic.io/app/<THIS_ID>/settings
//
// ── How the iOS stage works ────────────────────────────────────────────────────
//   1. POST /builds  → Codemagic queues the "ios-device" workflow
//   2. Poll GET /builds/<id> every 30 s until status is finished / failed
//   3. Download the .ipa URL from the build artefacts list
//   4. Archive the .ipa in Jenkins
//
// ── Docker images used ────────────────────────────────────────────────────────
//   iOS stages  : curlimages/curl (lightweight curl + jq-capable via apk)
//   Android stage: reactnativecommunity/react-native-android (Node + JDK + SDK)

pipeline {

    // Default agent: Ubuntu with Docker available
    agent {
        docker {
            image 'ubuntu:22.04'
            args  '-u root'
        }
    }

    environment {
        APP_NAME        = 'ReverseMarketplaceBuyer'
        CM_WORKFLOW_ID  = 'ios-device'      // must match the key in codemagic.yaml
        NOTIFY_EMAIL    = 'oqdeh93@gmail.com'
        POLL_INTERVAL   = '30'              // seconds between Codemagic status polls
        BUILD_TIMEOUT   = '3600'            // max seconds to wait for Codemagic (60 min)
    }

    options {
        timeout(time: 75, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    stages {

        // ── Stage 1 — Install base tools inside the Ubuntu container ───────────
        stage('Bootstrap Tools') {
            steps {
                sh '''
                    apt-get update -qq
                    apt-get install -y --no-install-recommends \
                        curl jq git ca-certificates 2>&1 | tail -5
                    echo "curl $(curl --version | head -1)"
                    echo "jq   $(jq --version)"
                '''
            }
        }

        // ── Stage 2 — Trigger iOS build on Codemagic ──────────────────────────
        stage('Trigger iOS Build (Codemagic)') {
            steps {
                withCredentials([
                    string(credentialsId: 'CODEMAGIC_API_TOKEN', variable: 'CM_TOKEN'),
                    string(credentialsId: 'CODEMAGIC_APP_ID',    variable: 'CM_APP_ID')
                ]) {
                    script {
                        def branch = env.GIT_BRANCH?.replaceAll('^origin/', '') ?: 'master'
                        echo "Triggering Codemagic workflow '${CM_WORKFLOW_ID}' on branch '${branch}'"

                        def response = sh(
                            returnStdout: true,
                            script: """
                                curl -s -X POST https://api.codemagic.io/builds \\
                                    -H "x-auth-token: ${CM_TOKEN}" \\
                                    -H "Content-Type: application/json" \\
                                    -d '{
                                        "appId":      "${CM_APP_ID}",
                                        "workflowId": "${CM_WORKFLOW_ID}",
                                        "branch":     "${branch}"
                                    }'
                            """
                        ).trim()

                        echo "Codemagic response: ${response}"

                        def buildId = sh(
                            returnStdout: true,
                            script: "echo '${response}' | jq -r '.buildId // .id // empty'"
                        ).trim()

                        if (!buildId || buildId == 'null') {
                            error("Failed to extract buildId from Codemagic response.\nResponse was: ${response}")
                        }

                        echo "Codemagic build ID: ${buildId}"
                        env.CM_BUILD_ID = buildId
                    }
                }
            }
        }

        // ── Stage 3 — Poll until Codemagic build completes ────────────────────
        stage('Wait for iOS Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'CODEMAGIC_API_TOKEN', variable: 'CM_TOKEN')
                ]) {
                    script {
                        def buildId      = env.CM_BUILD_ID
                        def maxWait      = env.BUILD_TIMEOUT.toInteger()
                        def pollInterval = env.POLL_INTERVAL.toInteger()
                        def elapsed      = 0
                        def finalStatus  = ''

                        echo "Polling https://api.codemagic.io/builds/${buildId} every ${pollInterval}s (max ${maxWait}s)…"

                        while (elapsed < maxWait) {
                            sleep(pollInterval)
                            elapsed += pollInterval

                            def statusJson = sh(
                                returnStdout: true,
                                script: """
                                    curl -s https://api.codemagic.io/builds/${buildId} \\
                                        -H "x-auth-token: ${CM_TOKEN}"
                                """
                            ).trim()

                            def status = sh(
                                returnStdout: true,
                                script: "echo '${statusJson}' | jq -r '.build.status // .status // \"unknown\"'"
                            ).trim()

                            echo "[${elapsed}s] Codemagic status: ${status}"

                            if (status in ['finished', 'failed', 'canceled', 'timeout']) {
                                finalStatus = status
                                env.CM_FINAL_STATUS = status
                                env.CM_STATUS_JSON  = statusJson
                                break
                            }
                        }

                        if (!finalStatus) {
                            error("Timed out after ${maxWait}s waiting for Codemagic build ${buildId}")
                        }
                        if (finalStatus != 'finished') {
                            error("Codemagic build ${buildId} ended with status: ${finalStatus}")
                        }

                        echo "Codemagic build finished successfully."
                    }
                }
            }
        }

        // ── Stage 4 — Download IPA artifact ───────────────────────────────────
        stage('Download IPA') {
            steps {
                withCredentials([
                    string(credentialsId: 'CODEMAGIC_API_TOKEN', variable: 'CM_TOKEN')
                ]) {
                    script {
                        def buildId    = env.CM_BUILD_ID
                        def statusJson = env.CM_STATUS_JSON

                        // Extract the first .ipa URL from the artefacts list
                        def ipaUrl = sh(
                            returnStdout: true,
                            script: """
                                echo '${statusJson}' | jq -r '
                                    (.build.artefacts // .artefacts // [])[]
                                    | select(.name | test("\\.ipa$"))
                                    | .url
                                ' | head -1
                            """
                        ).trim()

                        if (!ipaUrl || ipaUrl == 'null') {
                            // Fallback: query the build again explicitly for artefacts
                            def buildJson = sh(
                                returnStdout: true,
                                script: """
                                    curl -s https://api.codemagic.io/builds/${buildId} \\
                                        -H "x-auth-token: ${CM_TOKEN}"
                                """
                            ).trim()

                            ipaUrl = sh(
                                returnStdout: true,
                                script: """
                                    echo '${buildJson}' | jq -r '
                                        (.build.artefacts // .artefacts // [])[]
                                        | select(.name | test("\\.ipa$"))
                                        | .url
                                    ' | head -1
                                """
                            ).trim()
                        }

                        if (!ipaUrl || ipaUrl == 'null') {
                            error("No .ipa artefact URL found in Codemagic build ${buildId}. Check Codemagic dashboard.")
                        }

                        echo "Downloading IPA from: ${ipaUrl}"

                        sh """
                            mkdir -p artifacts/ios
                            curl -L -o "artifacts/ios/${APP_NAME}.ipa" \\
                                -H "x-auth-token: ${CM_TOKEN}" \\
                                "${ipaUrl}"
                            ls -lh artifacts/ios/
                        """

                        env.IPA_PATH = "artifacts/ios/${APP_NAME}.ipa"
                    }
                }
            }
        }

        // ── Stage 5 — Android debug APK (runs locally in Docker) ──────────────
        stage('Build Android APK') {
            agent {
                docker {
                    image 'reactnativecommunity/react-native-android:latest'
                    args  '-u root'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    node --version && java -version && sdkmanager --version 2>/dev/null || true
                    cd app && npm install
                    cd android && chmod +x gradlew && ./gradlew assembleDebug \
                        --no-daemon --stacktrace \
                        2>&1 | tail -40
                '''
            }
            post {
                success {
                    archiveArtifacts(
                        artifacts:   'app/android/app/build/outputs/apk/debug/*.apk',
                        fingerprint: true
                    )
                }
            }
        }

        // ── Stage 6 — Archive IPA in Jenkins ──────────────────────────────────
        stage('Archive iOS IPA') {
            steps {
                archiveArtifacts(
                    artifacts:   'artifacts/ios/*.ipa',
                    fingerprint: true
                )
                echo "IPA archived: ${env.IPA_PATH}"
            }
        }
    }

    post {
        always {
            sh 'rm -rf artifacts/ 2>/dev/null || true'
        }
        success {
            emailext(
                to:      env.NOTIFY_EMAIL,
                subject: "✅ Build Passed — ${env.APP_NAME} #${env.BUILD_NUMBER}",
                body:    """\
Build passed.

Job:        ${env.JOB_NAME}
Build:      #${env.BUILD_NUMBER}
Branch:     ${env.GIT_BRANCH ?: 'unknown'}
URL:        ${env.BUILD_URL}

iOS IPA and Android APK are attached as Jenkins build artifacts.
Codemagic build: https://codemagic.io/build/${env.CM_BUILD_ID ?: 'n/a'}
"""
            )
        }
        failure {
            emailext(
                to:      env.NOTIFY_EMAIL,
                subject: "❌ Build Failed — ${env.APP_NAME} #${env.BUILD_NUMBER}",
                body:    """\
Build failed.

Job:        ${env.JOB_NAME}
Build:      #${env.BUILD_NUMBER}
Branch:     ${env.GIT_BRANCH ?: 'unknown'}
URL:        ${env.BUILD_URL}

Codemagic build: https://codemagic.io/build/${env.CM_BUILD_ID ?: 'n/a'}

Check the Jenkins console output for details.
"""
            )
        }
    }
}
