#!/bin/bash

if [ -d "./plugins" ]; then
  echo "Main directory"
  cd ./plugins/tensorflow/
elif [ -d "../tensorflow" ]; then
  echo "Tensorflow directory"
else
  echo "Cannot find directory"
  exit 1
fi

echo "Do you want to install 'opencv4nodejs'"
echo "(y)es or (N)o? Default : YES"
read installcv4node

if [ "$installcv4node" != "n" ] && [ "$installcv4node" != "N" ]; then
  cd ../../
  echo "Shinobi - Do you want to let the \`opencv4nodejs\` npm package install OpenCV? "
  echo "This is recomended if you dont need GPU (Hardware Acceleration)."
  echo "(y)es or (N)o Default : NO"

  read nodejsinstall
  if [ "$nodejsinstall" = "y" ] || [ "$nodejsinstall" = "Y" ]; then
    unset OPENCV4NODEJS_DISABLE_AUTOBUILD
    export OPENCV4NODEJS_AUTOBUILD_FLAGS=-DBUILD_opencv_dnn=ON
  else
    export OPENCV4NODEJS_DISABLE_AUTOBUILD=1
  fi
  echo "Running.."
  npm uninstall opencv-build opencv4nodejs
  npm install opencv4nodejs

fi

echo "Do you want to install Models? This part needs sudo"
echo "(y)es or (N)o? Default : YES"
read installModels

if [ "$installModels" != "n" ] && [ "$installModels" != "N" ]; then
  echo "INSTALLING MODELS.."
  mkdir ./data/
  chmod -R 777 ./data
  cd ./data/

  //Download ssn_mobilenet_v1_ssn
  wget http://download.tensorflow.org/models/object_detection/ssd_mobilenet_v1_ppn_shared_box_predictor_300x300_coco14_sync_2018_07_03.tar.gz
  echo "Extracting files.."
  tar -xzvf ssd_mobilenet_v1_ppn_shared_box_predictor_300x300_coco14_sync_2018_07_03.tar.gz
  mv ./ssd_mobilenet_v1_ppn_shared_box_predictor_300x300_coco14_sync_2018_07_03/frozen_inference_graph.pb ./pb/ssd_mobilenet_v1_ppn_frozen.pb
  wget https://raw.githubusercontent.com/opencv/opencv_extra/master/testdata/dnn/ssd_mobilenet_v1_ppn_coco.pbtxt -P ./pbtxt/
  rm -R ./ssd_mobilenet_v1_ppn_shared_box_predictor_300x300_coco14_sync_2018_07_03*

  chmod -R 777 ./*
  cd ../../
  echo "MODELS INSTALLED"
fi

