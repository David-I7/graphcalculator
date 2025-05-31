FROM nginx:alpine


COPY ./packages/server/temp/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./packages/server/temp/nginx/conf.d /etc/nginx/conf.d