curl -X 'POST' \
  'http://localhost:8000/api/users/register/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-CSRFTOKEN: 70Lj7HXL1nqi48YSNJvTTkjDTAhQtVQmQHM810JHIPKcYtAioTlFrQPmu3hQfd3E' \
  -d '{
  "email": "user@example.com",
  "password": "string"
}'