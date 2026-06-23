curl -X 'POST' \
  'http://localhost:8000/api/users/api/token/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-CSRFTOKEN: K4rTamnJVQzlAoq89jqu4AhvQ4kkk10ftLsI4F9FCiTfuJ2yKtggC6Nerxkk6jdx' \
  -d '{
  "email": "afzalhossen2019@gmail.com",
  "password": "password"
}'