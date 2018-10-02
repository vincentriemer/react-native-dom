FROM farwayer/react-native:min

WORKDIR /usr/src

COPY . .

# FIXME: Hack around now.sh not including .git directory
RUN git init

RUN git submodule update --init
RUN yarn
RUN yarn compile

WORKDIR /usr/src/packages/react-native-dom
RUN yarn build:rntester
RUN mv dist /public