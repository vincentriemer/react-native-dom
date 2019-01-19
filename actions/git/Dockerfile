FROM alpine/git

LABEL name="git"
LABEL version="1.0.0"
LABEL maintainer="Vincent Riemer <vincentriemer@gmail.com>"

LABEL com.github.actions.name="GitHub Action for Git"
LABEL com.github.actions.description="Wraps the git CLI to enable common git commands."
LABEL com.github.actions.icon="git-branch"
LABEL com.github.actions.color="green"

COPY "entrypoint.sh" "/entrypoint.sh"
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["help"]