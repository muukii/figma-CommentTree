const { widget } = figma;
const {
  AutoLayout,
  Text,
  SVG,
  Input,
  Frame,
  useWidgetId,
  Span,
  Rectangle,
  Ellipse,
  Line,
} = widget;

export const VStack = (props: AutoLayoutProps) => {
  const composed = props;
  composed.direction = "vertical";
  return <AutoLayout {...composed} />;
};

export const HStack = (props: AutoLayoutProps) => {
  const composed = props;
  composed.direction = "horizontal";
  return <AutoLayout {...composed} />;
};
