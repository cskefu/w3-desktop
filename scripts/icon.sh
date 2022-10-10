#! /bin/bash 
###########################################
#
###########################################

# constants
baseDir=$(cd `dirname "$0"`;pwd)
cwdDir=$PWD
export PYTHONUNBUFFERED=1
export PATH=/opt/miniconda3/envs/venv-py3/bin:$PATH
export TS=$(date +%Y%m%d%H%M%S)

# functions

# main 
[ -z "${BASH_SOURCE[0]}" -o "${BASH_SOURCE[0]}" = "$0" ] || return
set -x
cd $baseDir/..
cp static/icon.png build/icon.png
convert static/icon.png -resize 16x16 build/icons/16x16.png
convert static/icon.png -resize 32x32 build/icons/32x32.png
convert static/icon.png -resize 48x48 build/icons/48x48.png
convert static/icon.png -resize 64x64 build/icons/64x64.png
convert static/icon.png -resize 128x128 build/icons/128x128.png
convert static/icon.png -resize 256x256 build/icons/256x256.png
convert static/icon.png -resize 512x512 build/icons/512x512.png

convert static/icon.png media/icon.svg
