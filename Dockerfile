FROM farwayer/react-native:min

WORKDIR /usr/src

COPY . .

RUN yarn
RUN yarn compile

WORKDIR /usr/src/packages/react-native-dom
RUN yarn build:rntester
RUN mv dist /public