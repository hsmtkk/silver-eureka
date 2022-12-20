#!/bin/sh
_REGION=us-central1
apt-get install jq -y
FLIGHT_URL=`gcloud run services describe flight --region=${_REGION} --format=json | jq .status.address.url`
sed -i 's/@FLIGHT_URL@/${FLIGHT_URL}/' tcc.yaml
HOTEL_URL=`gcloud run services describe hotel --region=${_REGION} --format=json | jq .status.address.url`
sed -i 's/@HOTEL_URL@/${HOTEL_URL}/' tcc.yaml
cat tcc.yaml
gcloud workflows deploy tcc --location=${_REGION} --source=tcc.yaml
