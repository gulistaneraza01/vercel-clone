FROM ubuntu:rolling

RUN apt update && apt upgrade -y
RUN apt install curl -y
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs

RUN apt install git -y

WORKDIR /user/app

COPY main.sh .
COPY index.js .
COPY config/ ./config/

RUN npm install

RUN chmod +x main.sh

ENTRYPOINT ["/user/app/main.sh"]
