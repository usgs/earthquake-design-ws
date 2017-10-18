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

# Wait for database to come up
sleep 30

# perform load of mssing data and start application
node src/lib/db/load_data.js --missing; node src/server.js &

child=$!
wait "$child"