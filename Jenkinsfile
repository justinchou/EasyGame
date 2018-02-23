pipeline {
  agent any
  stages {
    stage('Install Deps') {
      steps {
        sh 'yarn install'
      }
    }
    stage('Copy website Files') {
      environment {
        name = 'website'
      }
      parallel {
        stage('Copy website Files') {
          steps {
            sh '''mkdir -p website/bin/
cp bin/website website/bin/
cp -r zutils website/
cp -r zwebsite website/
cp gulpfile.js package.json README.md yarn.lock website/
'''
          }
        }
        stage('Copy platform Files') {
          steps {
            sh '''mkdir -p platform/bin/
cp bin/platform platform/bin/
cp -r zutils platform/
cp -r zplatform platform/
cp gulpfile.js package.json README.md yarn.lock platform/
'''
          }
        }
        stage('Copy hall Files') {
          steps {
            sh '''mkdir -p hall/bin/
cp bin/hall hall/bin/
cp -r zutils hall/
cp -r zhall hall/
cp gulpfile.js package.json README.md yarn.lock hall/
'''
          }
        }
      }
    }
    stage('Copy config Files') {
      parallel {
        stage('Copy config Files') {
          steps {
            sh '''# mkdir -p website/config
# cp -r config/dev/* website/config 

ls website'''
          }
        }
        stage('Copy config File') {
          steps {
            sh '''# mkdir -p platform/config
# cp -r config/dev/* platform/config 

ls platform'''
          }
        }
      }
    }
    stage('Compile website Project') {
      parallel {
        stage('Compile website Project') {
          steps {
            sh 'tar zcvf website.tar.gz website/'
          }
        }
        stage('Compile platform Project') {
          steps {
            sh 'tar zcvf platform.tar.gz platform/'
          }
        }
      }
    }
    stage('Remove website Folder') {
      parallel {
        stage('Remove website Folder') {
          steps {
            sh 'rm -rf website'
          }
        }
        stage('Remove platform Folder') {
          steps {
            sh 'rm -rf platform'
          }
        }
      }
    }
    stage('Copy to Servers') {
      steps {
        sh '''scp ./website.tar.gz -P 40022 root@aliyun:/data/jenkins/test/
'''
      }
    }
    stage('Remove website File') {
      parallel {
        stage('Remove website File') {
          steps {
            sh 'rm -rf website.tar.gz'
          }
        }
        stage('Remove platform') {
          steps {
            sh 'rm -rf platform.tar.gz'
          }
        }
      }
    }
  }
}