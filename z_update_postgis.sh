#!/bin/bash -e

update=$(which update-postgis.sh || echo '/usr/local/bin/update-postgis.sh');
if [ -x $update ]; then
  ${update};
fi