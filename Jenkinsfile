pipeline {
  agent any
  stages {
    stage('Install Deps') {
      steps {
        sh 'yarn install'
      }
    }
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
    stage('Copy config Files') {
      steps {
        sh '''# mkdir -p website/config
# cp -r config/dev/* website/config 

ls website'''
      }
    }
    stage('Compile website Project') {
      steps {
        sh 'tar zcvf website.tar.gz website/'
      }
    }
    stage('Remove website Folder') {
      steps {
        sh 'rm -rf website'
      }
    }
    stage('Copy to Servers') {
      steps {
        sh '''scp ./website.tar.gz -P 40022 root@aliyun:/data/jenkins/test/
'''
      }
    }
    stage('Remove website File') {
      steps {
        sh 'rm -rf website.tar.gz'
      }
    }
  }
}