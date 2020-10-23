function extractEstimate(issue) {
  const match = issue.body.match(/^Estimate: (\d+)/m);

  if (match) {
    return {
      ...issue,
      estimate: +match[1],
    };
  } else if (issue.dependencies.length > 0) {
    return {
      ...issue,
      estimate: 0,
    };
  } else {
    throw new Error(`Issue ${issue.number}: Must supply estimate.`);
  }
}

module.exports = extractEstimate;
