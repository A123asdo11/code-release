#!/bin/bash
[ -d /data/code/$1/$2 ] || mkdir -pv /data/code/$1/$2
cd /data/code/$1/$2
svn update -r $4
/usr/bin/rsync -av /data/code/$1/$2/ $5::code/$1 --password-file=/data/app/nginx/html/p.publish.com/passwd --exclude-from=/data/app/nginx/html/p.publish.com/exclude.list --delete