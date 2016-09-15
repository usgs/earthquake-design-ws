#! /bin/bash --login


# root of project
cd `dirname $0`/../..


# "exec" seems like a much simpler solution for this,
# but node appears to ignore the SIGTERM
_term () {
  echo 'Caught SIGTERM'
  kill -TERM "$child"
}
trap _term SIGTERM


# start application
node src/server.js &


child=$!
wait "$child"
