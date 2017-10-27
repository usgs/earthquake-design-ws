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
until timeout 1 bash -c "echo > /dev/tcp/${DB_HOST}/${DB_PORT}"
do
  echo "waiting for postgres"
  sleep 1
done

# perform load of mssing data and start application
node src/server.js &

child=$!
wait "$child"