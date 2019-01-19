FROM node:10

LABEL name="yarn"
LABEL version="1.0.0"
LABEL maintainer="Vincent Riemer <vincentriemer@gmail.com>"

LABEL com.github.actions.name="GitHub Action for Yarn"
LABEL com.github.actions.description="Wraps the yarn CLI to enable common yarn commands."
LABEL com.github.actions.icon="package"
LABEL com.github.actions.color="blue"

COPY "entrypoint.sh" "/entrypoint.sh"
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["help"]