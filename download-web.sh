#!/bin/sh
rm -rf web/
curl -O http://ebible.org/Scriptures/eng-web_usfm.zip
unzip eng-web_usfm.zip -d web
rm eng-web_usfm.zip
