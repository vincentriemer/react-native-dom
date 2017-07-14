import RCTKeyframeGenerator from "RCTKeyframeGenerator";

test("generates tranditional easing function keyframes", () => {
  const linear = RCTKeyframeGenerator(
    {
      type: "linear"
    },
    1000
  );
  expect(linear).toMatchSnapshot();

  const easeIn = RCTKeyframeGenerator(
    {
      type: "easeIn"
    },
    1000
  );
  expect(easeIn).toMatchSnapshot();

  const easeOut = RCTKeyframeGenerator(
    {
      type: "easeOut"
    },
    1000
  );
  expect(easeOut).toMatchSnapshot();

  const easeInEaseOut = RCTKeyframeGenerator(
    {
      type: "easeInEaseOut"
    },
    1000
  );
  expect(easeInEaseOut).toMatchSnapshot();
});

test("generates spring keyframes without initialVelocity", () => {
  const springWithoutVelocity = RCTKeyframeGenerator({
    type: "spring",
    springDamping: 0.5
  });
  expect(springWithoutVelocity).toMatchSnapshot();
});

test("generates spring keyframes with negative initialVelocity", () => {
  const springWithVelocity = RCTKeyframeGenerator({
    type: "spring",
    springDamping: 0.5,
    initialVelocity: -50
  });
  expect(springWithVelocity).toMatchSnapshot();
});
