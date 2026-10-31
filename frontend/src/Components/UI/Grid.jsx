import React from "react";

export const Row = ({
  children,
  gutter = 0,
  className = "",
  style,
  justify,
  align,
  ...props
}) => {
  const gutterX = Array.isArray(gutter) ? gutter[0] : gutter;
  const gutterY = Array.isArray(gutter) ? gutter[1] : 0;

  const marginX = gutterX ? -gutterX / 2 : 0;
  const marginY = gutterY ? -gutterY / 2 : 0;

  return (
    <div
      className={`flex flex-wrap ${className}`}
      style={{
        marginLeft: marginX,
        marginRight: marginX,
        marginTop: marginY,
        marginBottom: marginY,
        justifyContent: justify,
        alignItems: align,
        ...style,
      }}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          style: {
            paddingLeft: gutterX ? gutterX / 2 : 0,
            paddingRight: gutterX ? gutterX / 2 : 0,
            paddingTop: gutterY ? gutterY / 2 : 0,
            paddingBottom: gutterY ? gutterY / 2 : 0,
            ...child.props.style,
          },
        });
      })}
    </div>
  );
};

export const Col = ({
  children,
  span,
  xs,
  sm,
  md,
  lg,
  xl,
  className = "",
  style,
  ...props
}) => {
  const classes = ["grid-col"];

  if (span) {
    classes.push(`col-${span}`);
  } else if (xs) {
    classes.push(`col-${xs}`);
  } else if (sm || md || lg || xl) {
    classes.push("col-24");
  }

  if (sm) classes.push(`col-sm-${sm}`);
  if (md) classes.push(`col-md-${md}`);
  if (lg) classes.push(`col-lg-${lg}`);
  if (xl) classes.push(`col-xl-${xl}`);

  // When no column spans or breakpoints are provided, auto-size
  const isAuto = !span && !xs && !sm && !md && !lg && !xl;

  return (
    <div
      className={`${classes.join(" ")} ${isAuto ? "flex-1 max-w-full" : ""} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export const Divider = ({
  children,
  orientation = "center",
  className = "",
  style,
  ...props
}) => {
  if (!children) {
    return (
      <hr
        className={`my-4 border-gray-200 ${className}`}
        style={style}
        {...props}
      />
    );
  }
  return (
    <div
      className={`relative flex items-center my-6 ${className}`}
      style={style}
      {...props}
    >
      <div className="flex-grow border-t border-gray-200"></div>
      <span className="flex-shrink mx-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
        {children}
      </span>
      <div className="flex-grow border-t border-gray-200"></div>
    </div>
  );
};

export default { Row, Col, Divider };

