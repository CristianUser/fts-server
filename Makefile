services = postgres

start:
	make start-services && make start-server

start-services:
	docker-compose up -d $(services)

start-server:
	cd src && npm i && npm run start:dev

stop-services:
	docker-compose stop $(services)

remove-containers:
	@echo "Removing all stopped containers..."
	docker-compose rm $(services)

burn:
	@echo "Stopping and removing all containers..."
	make stop-services && make remove-containers

clean-data:
	rm -rf ./docker/**/data

reset:
	make burn clean-data start

default: start
