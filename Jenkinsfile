pipeline {
  agent any
  stages {
    stage('Install Deps') {
      parallel {
        stage('Install Deps') {
          steps {
            sh 'yarn install --offline'
          }
        }
        stage('Remove Spams') {
          steps {
            sh '''rm -rf website website.tar.gz
rm -rf platform platform.tar.gz
rm -rf hall hall.tar.gz
'''
          }
        }
      }
    }
    stage('Copy website Files') {
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
        stage('Copy hall Files') {
          steps {
            sh '''# mkdir -p hall/config
# cp -r config/dev/* hall/config 

ls hall'''
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
        stage('Compile hall Project') {
          steps {
            sh 'tar zcvf hall.tar.gz hall/'
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
        stage('Remove hall Folder') {
          steps {
            sh 'rm -rf hall'
          }
        }
      }
    }
    stage('Copy to Servers') {
      parallel {
        stage('Copy to Website Servers') {
          steps {
            sh '''scp -P 40022 ./website.tar.gz root@aliyun:/data/jenkins/test/
'''
          }
        }
        stage('Copy to Platform Servers') {
          steps {
            sh 'scp -P 40022 ./platform.tar.gz root@aliyun:/data/jenkins/test/'
          }
        }
        stage('Copy to Hall Servers') {
          steps {
            sh 'scp -P 40022 ./hall.tar.gz root@aliyun:/data/jenkins/test/'
          }
        }
      }
    }
    stage('Remove website File') {
      parallel {
        stage('Remove website File') {
          steps {
            sh 'rm -rf website.tar.gz'
          }
        }
        stage('Remove platform File') {
          steps {
            sh 'rm -rf platform.tar.gz'
          }
        }
        stage('Remove hall File') {
          steps {
            sh 'rm -rf hall.tar.gz'
          }
        }
      }
    }
  }
}