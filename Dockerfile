FROM nginx
COPY dist/ /web
COPY nginx.conf /etc/nginx/conf.d/default.conf
#docker  run -p 80:80 --name front -d forum-frontend