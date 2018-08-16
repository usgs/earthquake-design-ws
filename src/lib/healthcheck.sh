#!/bin/bash -ex

host=$(hostname -i || echo '127.0.0.1');
port="${PORT:-8000}";
mount_path="${MOUNT_PATH:-/}";

args=(
  -s
  -o /dev/null
  -w '{http_code}'
  "http://${host}:${port}${mount_path}/"
);

http_code=$(curl "${args[@]}");
result=$?;

if [[ $result -eq 0 && $http_code -eq 200 ]]; then
  echo '[HEALTHCHECK] Webserver up and accepting connections.';
  exit 0;
fi

echo '[HEALTHCHECK] Webserver not healthy.';
exit 1;
