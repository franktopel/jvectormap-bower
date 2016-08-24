#!/bin/bash

files=( \
  jquery-jvectormap.js \
  lib/jquery-mousewheel.js \
  src/jvectormap.js \
  src/abstract-element.js \
  src/abstract-canvas-element.js \
  src/abstract-shape-element.js \
  src/svg-element.js \
  src/svg-group-element.js \
  src/svg-canvas-element.js \
  src/svg-shape-element.js \
  src/svg-path-element.js \
  src/svg-circle-element.js \
  src/svg-image-element.js \
  src/svg-text-element.js \
  src/vml-element.js \
  src/vml-group-element.js \
  src/vml-canvas-element.js \
  src/vml-shape-element.js \
  src/vml-path-element.js \
  src/vml-circle-element.js \
  src/vector-canvas.js \
  src/simple-scale.js \
  src/ordinal-scale.js \
  src/numeric-scale.js \
  src/color-scale.js \
  src/legend.js \
  src/data-series.js \
  src/proj.js \
  src/map-object.js \
  src/region.js \
  src/marker.js \
  src/map.js \
  src/multimap.js \
)

baseDir=`dirname $0`

counter=0
while [ $counter -lt ${#files[@]} ]; do
  files[$counter]="$baseDir/${files[$counter]}"
  let counter=counter+1
done

if [ -z "$1" ]
  then
    minified=$baseDir/dist/jquery.jvectormap.min.js
    beautified=$baseDir/dist/jquery.jvectormap.js
  else
    minified=$1.min.js
    beautified=$1.js
fi

if [ -a $minified ]
  then
    rm $minified
fi

if [ -a $beautified ]
  then
    rm $beautified
fi

cat ${files[*]} >> $minified
cat ${files[*]} >> $beautified

uglifyjs $minified -o $minified -c
uglifyjs $beautified -o $beautified -b