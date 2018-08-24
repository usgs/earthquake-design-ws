#!/bin/bash -e

host=$(hostname -i || echo '127.0.0.1');
user="${POSTGRES_USER:-postgres}";
db="${POSTGRES_DB:-$user}";
export PGPASSWORD="${POSTGRES_PASSWORD:-}";

args=(
  --host "${host}"
  --username "${user}"
  --dbname "${db}"
  --quiet --no-align --tuples-only
);

select=$(echo 'SELECT 1' | psql "${args[@]}");
result=$?;

if [[ $result -eq 0 && $select -eq 1 ]]; then
  echo '[HEALTHCHECK] Database up and accepting connections.';
  exit 0;
fi

echo '[HEALTHCHECK] Database not healthy.';
exit 1;
