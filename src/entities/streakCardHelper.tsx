const getOuterStrokeStyle = (radius: number, innerFraction: number, isInner = false, outerFraction = 5/9) => {
  const percentage = isInner ? innerFraction * outerFraction : innerFraction;
  const circumference = radius * 2 * Math.PI;
  const offset = `${circumference - percentage * circumference}`;
  return {
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset: offset,
  };
}

export {
  getOuterStrokeStyle,
}
