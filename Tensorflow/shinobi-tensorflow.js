// Base Init
var fs=require('fs');
var path = require("path");
var exec = require('child_process').exec;
var config = require('./conf.json');
var cv=require('opencv4nodejs');

if (!cv.modules.dnn) {
  throw new Error("exiting: opencv4nodejs compiled without dnn module. recompile opencv with '-D WITH_dnn=ON' flag");
}

var s
try{
    s = require('../pluginBase.js')(__dirname,config)
}catch(err){
    console.log(err)
    try{
        s = require('./pluginBase.js')(__dirname,config)
    }catch(err){
        console.log(err)
        return console.log(config.plug,'Plugin start has failed. This may be because you started this plugin on another machine. Just copy the pluginBase.js file into this (plugin) directory.')
        return console.log(config.plug,'pluginBase.js was not found.')
    }
}

//model location
const modelFolderPath = './plugins/tensorflow/data/'

//OPTIONS

const pbFile = path.resolve(modelFolderPath, "pb/ssd_mobilenet_v1_ppn_frozen.pb")
const pbtxtFile = path.resolve(modelFolderPath, "pbtxt/ssd_mobilenet_v1_ppn_coco.pbtxt")

const classNames = require("./data/classNames/coco_classNames.js");
const imgThresh = '0.4'


if (!fs.existsSync(pbFile) || !fs.existsSync(pbtxtFile)) {
  console.log("could not find detection model")
  console.log(pbFile)
  console.log(pbtxtFile)
  throw new Error("exiting")
}

// initialize tensorflow model from modelFile
const net = cv.readNetFromTensorflow(pbFile, pbtxtFile);

// Main Function
s.detectObject = function(buffer,d,tx,frameLocation){
  var detectStuff = function(frameBuffer,callback){
    cv.imdecodeAsync(frameBuffer,(err,im) => {
        if(err){
          console.log(err)
          return
        }

        // object detection model works with 300 x 300 images
        const size = new cv.Size(300, 300);
        const vec3 = new cv.Vec(0, 0, 0);

        // network accepts blobs as input
        const inputBlob = cv.blobFromImage(im, 1, size, vec3, true, true);
        net.setInput(inputBlob);

//        console.time("net.forward");
        // forward pass input through entire network, will return
        // classification result as 1x1xNxM Mat
        const outputBlob = net.forward();
        console.timeEnd("net.forward");

        // get height and width from the image
        const [imgHeight, imgWidth] = im.sizes;
        const numRows = outputBlob.sizes.slice(2, 3);

        matrices = []

        for (let y = 0; y < numRows; y += 1) {
          const confidence = outputBlob.at([0, 0, y, 2]);
          if (confidence > imgThresh) {
            const classId = outputBlob.at([0, 0, y, 1]);
            const className = classNames[classId];
            const boxX = imgWidth * outputBlob.at([0, 0, y, 3]);
            const boxY = imgHeight * outputBlob.at([0, 0, y, 4]);
            const boxWidht = imgWidth * outputBlob.at([0, 0, y, 5]);
            const boxHeight = imgHeight * outputBlob.at([0, 0, y, 6]);


            //if you want confidence to display with %
            const text = `${className} ${confidence.toString().substring(2,4)+"%"}`
            //or default with a few decimals removed
//            const text = `${className} ${confidence.toFixed(5)}`;
  

            matrices.push({
                x: boxX,
                y: boxY,
                width: boxWidht,
                height: boxHeight,
                tag: text,
                confidence: confidence,
            })

            //TRIGGER
            tx({
                f: 'trigger',
                id:  d.id,
                ke: d.ke,
                details: {
                  plug: config.plug,
                  name: 'detection',
                  reason: 'object',
                  matrices: matrices,
                  imgHeight: d.mon.detector_scale_y,
                  imgWidth: d.mon.detector_scale_x,
                  frame: d.base64
                }
            })
          }
        }
    })
  }

  if(frameLocation){
      fs.readFile(frameLocation,function(err,buffer){
          if(!err){
              detectStuff(buffer)
          }
          fs.unlink(frameLocation,function(){

          })
      })
  }else{
    detectStuff(buffer)
  }
}

