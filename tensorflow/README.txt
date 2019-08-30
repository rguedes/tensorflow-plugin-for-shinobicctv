

TENSORFLOW
  Shinobi plugin for Tensorflow object detection models


DISCLAIMER
  EXPERIMENTAL expect bugs.
  To get the most out of Tensorflow in general you have to find/configure a model depending on your needs. 


DEPENDECIES 
  opencv4nodejs
    OpenCV built with dnn and default modules


INSTALL
  Run INSTALL.sh from main Shinobi dir.
  
  Installer will install opencv4nodejs and download tensorflow models.
  It can also install opencv for you, try this if you're having problems.

  
CONFIGURATION
  cp conf.sample.json conf.json 
 
  Add your key to the main Shinobi config, then change key in tensorflow conf.json to match the main config. 
  
Example plugin conf
{
  "plug":"Tensorflow",
  "host":"localhost",
  "port":8080,
  "hostPort":8082,
  "key":"secretkey123",
  "type":"detector"
}

Example end of Main conf

  "cron":{
      "key":"secret__cron__key"
  },
  "pluginKeys":{
    "Tensorflow": "secretkey123"
  }
}


RUNNING

  With nodejs
    nodejs ./plugins/tensorflow/shinobi-tensorflow.js

  With pm2 daemon
    pm2 start ./plugins/tensorflow/shinobi-tensorflow.js

  Plugins should always be started from main Shinobi dir.


  You should now see this under 'Monitor Settings'.
    Motion Detection Primary Engine : Tensorflow Connected





TODO
  INSTALLER
    add CUDA option with multiple package managers
    check if cmake is missing then install it

  OPTIONS IN APP
    pb file selector(pick one)
    pbtxt file selector(pick one)
    className file selector(pick one)
    detection threshold slider 1-100%
    expected size 300x300
    blacklist objects menu

  CONFIG
    support for running in host mode
  OTHER
    make better README
